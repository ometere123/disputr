# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
from genlayer import *
import typing


ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

RESULT_UPHOLD = "uphold"
RESULT_OVERTURN = "overturn"
RESULT_SPLIT = "split_adjustment"

STATUS_PENDING = "pending_review"
STATUS_FINALIZED = "finalized"


@allow_storage
@dataclass
class Appeal:
    appeal_id: u64
    dispute_id: u64
    appellant: str
    stake: u256
    appeal_cid: str
    status: str
    final_result: str
    confidence_bps: u32
    reasoning: str
    opened_at: str
    reviewed_at: str


def _valid_appeal_result(data) -> bool:
    if not isinstance(data, dict):
        return False

    result = data.get("result")
    if result not in (RESULT_UPHOLD, RESULT_OVERTURN, RESULT_SPLIT):
        return False

    confidence = data.get("confidence")
    if not isinstance(confidence, (int, float)):
        return False
    if confidence < 0 or confidence > 1:
        return False

    reasoning = data.get("reasoning")
    if not isinstance(reasoning, str):
        return False
    if len(reasoning) < 20:
        return False

    return True


def _to_bps(value) -> u32:
    if isinstance(value, int):
        if value < 0:
            return u32(0)
        if value <= 1:
            return u32(value * 10000)
        if value > 10000:
            return u32(10000)
        return u32(value)

    if isinstance(value, float):
        if value < 0:
            return u32(0)
        if value > 1:
            return u32(10000)
        return u32(int(value * 10000))

    return u32(0)


class Contract(gl.Contract):
    owner: str
    reviewer: str
    minimum_stake: u256
    next_appeal_id: u64

    # appeal_id string -> Appeal
    appeals: TreeMap[str, Appeal]

    # appeal_id string -> bool
    appeal_exists: TreeMap[str, bool]

    # dispute_id string -> latest appeal id
    latest_appeal_for_dispute: TreeMap[str, u64]

    def __init__(self) -> None:
        deployer = str(gl.message.sender_address)

        self.owner = deployer
        self.reviewer = deployer
        self.minimum_stake = u256(20_000_000_000_000_000)
        self.next_appeal_id = u64(0)

        # IMPORTANT:
        # Do NOT initialise TreeMap fields here.
        # GenLayer storage fields are declared above and used directly.

    def _sender(self) -> str:
        return str(gl.message.sender_address)

    def _addr_to_str(self, addr: Address) -> str:
        return str(addr)

    def _u64_key(self, value: u64) -> str:
        return str(value)

    def _only_owner(self) -> None:
        if self._sender() != self.owner:
            raise gl.vm.UserError("only owner")

    def _only_reviewer(self) -> None:
        sender = self._sender()

        if sender != self.reviewer and sender != self.owner:
            raise gl.vm.UserError("only reviewer or owner")

    def _require_appeal_exists(self, appeal_id: u64) -> None:
        appeal_key = self._u64_key(appeal_id)

        if not self.appeal_exists.get(appeal_key, False):
            raise gl.vm.UserError("appeal not found")

    def _valid_cid(self, cid: str) -> bool:
        return cid != "" and len(cid) >= 10 and len(cid) <= 120

    @gl.public.write
    def set_reviewer(self, new_reviewer: Address) -> None:
        self._only_owner()

        reviewer_str = self._addr_to_str(new_reviewer)

        if reviewer_str == ZERO_ADDRESS:
            raise gl.vm.UserError("reviewer address is required")

        self.reviewer = reviewer_str

    @gl.public.write
    def set_minimum_stake(self, new_minimum_stake: u256) -> None:
        self._only_owner()

        self.minimum_stake = new_minimum_stake

    @gl.public.write.payable
    def open_appeal(self, dispute_id: u64, appeal_cid: str) -> u64:
        if dispute_id == u64(0):
            raise gl.vm.UserError("dispute id is required")

        if gl.message.value < self.minimum_stake:
            raise gl.vm.UserError("appeal stake below minimum")

        if not self._valid_cid(appeal_cid):
            raise gl.vm.UserError("valid appeal evidence CID is required")

        self.next_appeal_id = self.next_appeal_id + u64(1)
        appeal_id = self.next_appeal_id
        appeal_key = self._u64_key(appeal_id)
        dispute_key = self._u64_key(dispute_id)

        self.appeals[appeal_key] = Appeal(
            appeal_id=appeal_id,
            dispute_id=dispute_id,
            appellant=self._sender(),
            stake=gl.message.value,
            appeal_cid=appeal_cid,
            status=STATUS_PENDING,
            final_result="",
            confidence_bps=u32(0),
            reasoning="",
            opened_at=gl.message_raw["datetime"],
            reviewed_at="",
        )

        self.appeal_exists[appeal_key] = True
        self.latest_appeal_for_dispute[dispute_key] = appeal_id

        return appeal_id

    @gl.public.write
    def review_appeal(
        self,
        appeal_id: u64,
        original_verdict_summary: str,
        original_evidence_cid: str,
    ) -> None:
        self._only_reviewer()
        self._require_appeal_exists(appeal_id)

        if original_verdict_summary == "":
            raise gl.vm.UserError("original verdict summary is required")

        appeal_key = self._u64_key(appeal_id)
        storage_appeal = self.appeals[appeal_key]

        if storage_appeal.status != STATUS_PENDING:
            raise gl.vm.UserError("appeal already reviewed")

        appeal = gl.storage.copy_to_memory(storage_appeal)

        def fetch_ipfs(cid: str) -> str:
            if cid == "":
                return ""

            response = gl.nondet.web.request(
                "https://w3s.link/ipfs/" + cid,
                method="GET",
            )

            if response.status_code >= 400:
                raise Exception("CID could not be fetched")

            return response.body.decode("utf-8")[:12000]

        def leader_fn():
            appeal_text = fetch_ipfs(appeal.appeal_cid)
            original_text = fetch_ipfs(original_evidence_cid)

            prompt = f"""
You are the Disputr appeal adjudication contract.

Your job:
Review whether the original dispute verdict should be upheld, overturned, or adjusted.

Allowed results:
- uphold: the original verdict should remain unchanged
- overturn: the original verdict is materially wrong and should be reversed
- split_adjustment: the original verdict is partly correct but needs a partial adjustment

Original verdict summary:
{original_verdict_summary}

Original evidence text:
{original_text}

Appeal evidence text:
{appeal_text}

Rules:
- Base your answer only on the supplied original verdict, original evidence, and appeal evidence.
- Do not invent facts.
- If the appeal evidence is weak, unclear, irrelevant, or unavailable, uphold the original verdict.
- Use split_adjustment only when both sides have partly valid claims.
- Confidence must be between 0.0 and 1.0.

Return only JSON with exactly these fields:
{{
  "result": "uphold" | "overturn" | "split_adjustment",
  "confidence": 0.0,
  "reasoning": "concise final appeal reasoning"
}}
"""

            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False

            data = leader_result.calldata

            if not _valid_appeal_result(data):
                return False

            return True

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        storage_appeal.final_result = str(result["result"])
        storage_appeal.confidence_bps = _to_bps(result["confidence"])
        storage_appeal.reasoning = str(result["reasoning"])[:4000]
        storage_appeal.status = STATUS_FINALIZED
        storage_appeal.reviewed_at = gl.message_raw["datetime"]

        self.appeals[appeal_key] = storage_appeal

    @gl.public.view
    def get_appeal(self, appeal_id: u64) -> typing.Any:
        self._require_appeal_exists(appeal_id)

        appeal_key = self._u64_key(appeal_id)
        appeal = self.appeals[appeal_key]

        return {
            "appeal_id": appeal.appeal_id,
            "dispute_id": appeal.dispute_id,
            "appellant": appeal.appellant,
            "stake": appeal.stake,
            "appeal_cid": appeal.appeal_cid,
            "status": appeal.status,
            "final_result": appeal.final_result,
            "confidence_bps": appeal.confidence_bps,
            "reasoning": appeal.reasoning,
            "opened_at": appeal.opened_at,
            "reviewed_at": appeal.reviewed_at,
        }

    @gl.public.view
    def get_latest_appeal_for_dispute(self, dispute_id: u64) -> u64:
        dispute_key = self._u64_key(dispute_id)

        return self.latest_appeal_for_dispute.get(dispute_key, u64(0))

    @gl.public.view
    def appeal_is_open(self, appeal_id: u64) -> bool:
        appeal_key = self._u64_key(appeal_id)

        if not self.appeal_exists.get(appeal_key, False):
            return False

        appeal = self.appeals[appeal_key]

        return appeal.status == STATUS_PENDING

    @gl.public.view
    def total_appeals(self) -> u64:
        return self.next_appeal_id

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def get_reviewer(self) -> str:
        return self.reviewer

    @gl.public.view
    def get_minimum_stake(self) -> u256:
        return self.minimum_stake