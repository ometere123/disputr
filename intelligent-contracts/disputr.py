# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
from datetime import datetime
from genlayer import *
import typing


@gl.evm.contract_interface
class _NativeRecipient:
    class View:
        pass

    class Write:
        pass


ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

STATUS_PENDING_RESPONSE = "pending_response"
STATUS_READY = "ready_for_evaluation"
STATUS_RESOLVED = "resolved"
STATUS_APPEALED = "appealed"
STATUS_SETTLED = "settled"

APPEAL_PENDING = "pending"
APPEAL_RESOLVED = "resolved"

WINNER_CLAIMANT = "claimant"
WINNER_RESPONDENT = "respondent"
WINNER_SPLIT = "split"

BPS_DENOMINATOR = u256(10000)


@allow_storage
@dataclass
class Verdict:
    winner: str
    split_ratio_bps: u32
    confidence_bps: u32
    reasoning: str
    claimant_weight_bps: u32
    respondent_weight_bps: u32
    reasoning_trace: str


@allow_storage
@dataclass
class Dispute:
    id: u64
    claimant: str
    respondent: str
    claimant_cid: str
    respondent_cid: str
    scope_cid: str
    status: str
    stake: u256
    created_at: u64
    response_deadline: u64
    appeal_deadline: u64
    settled: bool
    settled_at: u64
    claimant_paid: u256
    respondent_paid: u256
    verdict: Verdict


@allow_storage
@dataclass
class AppealRecord:
    dispute_id: u64
    appellant: str
    stake: u256
    evidence_cid: str
    status: str
    opened_at: u64


def _empty_verdict() -> Verdict:
    return Verdict(
        winner="",
        split_ratio_bps=u32(0),
        confidence_bps=u32(0),
        reasoning="",
        claimant_weight_bps=u32(0),
        respondent_weight_bps=u32(0),
        reasoning_trace="",
    )


def _now_seconds() -> u64:
    raw = str(gl.message_raw["datetime"])
    normalized = raw.replace("Z", "+00:00")

    try:
        return u64(int(datetime.fromisoformat(normalized).timestamp()))
    except:
        return u64(0)


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


def _valid_verdict(data) -> bool:
    if not isinstance(data, dict):
        return False

    winner = data.get("winner")
    if winner not in (WINNER_CLAIMANT, WINNER_RESPONDENT, WINNER_SPLIT):
        return False

    for key in ("confidence", "claimant_weight", "respondent_weight"):
        value = data.get(key)
        if not isinstance(value, (int, float)):
            return False
        if value < 0 or value > 1:
            return False

    split = data.get("split_ratio", 0)
    if not isinstance(split, (int, float)):
        return False
    if split < 0 or split > 1:
        return False

    reasoning = data.get("reasoning")
    if not isinstance(reasoning, str):
        return False
    if len(reasoning) < 20:
        return False

    trace = data.get("reasoning_trace", "")
    if not isinstance(trace, str):
        return False

    return True


class Contract(gl.Contract):
    owner: str
    next_dispute_id: u64
    minimum_appeal_stake: u256
    response_window_seconds: u64
    appeal_window_seconds: u64

    disputes: TreeMap[str, Dispute]
    dispute_exists: TreeMap[str, bool]
    history: TreeMap[str, str]
    appeals: TreeMap[str, AppealRecord]
    appeal_exists: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = str(gl.message.sender_address)
        self.next_dispute_id = u64(0)

        # 0.01 GEN, because native GEN uses 18 decimals.
        self.minimum_appeal_stake = u256(10_000_000_000_000_000)

        self.response_window_seconds = u64(72 * 60 * 60)
        self.appeal_window_seconds = u64(72 * 60 * 60)

        # Do NOT initialise TreeMap fields here.

    def _sender(self) -> str:
        return str(gl.message.sender_address)

    def _addr_to_str(self, addr: Address) -> str:
        return str(addr)

    def _u64_key(self, value: u64) -> str:
        return str(value)

    def _only_owner(self) -> None:
        if self._sender() != self.owner:
            raise gl.vm.UserError("only owner")

    def _require_dispute_exists(self, dispute_id: u64) -> None:
        dispute_key = self._u64_key(dispute_id)

        if not self.dispute_exists.get(dispute_key, False):
            raise gl.vm.UserError("dispute not found")

    def _valid_cid(self, cid: str) -> bool:
        return cid != "" and len(cid) >= 10 and len(cid) <= 120

    def _append_csv(self, current: str, value: u64) -> str:
        value_str = str(value)

        if current == "":
            return value_str

        return current + "," + value_str

    def _append_history(self, party: str, dispute_id: u64) -> None:
        current = self.history.get(party, "")
        self.history[party] = self._append_csv(current, dispute_id)

    def _csv_to_u64_list(self, csv: str) -> typing.Any:
        if csv == "":
            return []

        parts = csv.split(",")
        items = []

        for part in parts:
            if part != "":
                items.append(u64(int(part)))

        return items

    def _amount_from_bps(self, amount: u256, bps: u32) -> u256:
        return (amount * u256(bps)) // BPS_DENOMINATOR

    def _send_value(self, recipient: str, amount: u256) -> None:
        if amount == u256(0):
            return

        if recipient == ZERO_ADDRESS:
            raise gl.vm.UserError("payout recipient is required")

        _NativeRecipient(Address(recipient)).emit_transfer(value=amount)

    @gl.public.write
    def set_minimum_appeal_stake(self, new_minimum_appeal_stake: u256) -> None:
        self._only_owner()

        if new_minimum_appeal_stake == u256(0):
            raise gl.vm.UserError("minimum appeal stake cannot be zero")

        self.minimum_appeal_stake = new_minimum_appeal_stake

    @gl.public.write
    def set_windows(
        self,
        new_response_window_seconds: u64,
        new_appeal_window_seconds: u64,
    ) -> None:
        self._only_owner()

        if new_response_window_seconds == u64(0):
            raise gl.vm.UserError("response window is required")

        if new_appeal_window_seconds == u64(0):
            raise gl.vm.UserError("appeal window is required")

        self.response_window_seconds = new_response_window_seconds
        self.appeal_window_seconds = new_appeal_window_seconds

    @gl.public.write.payable
    def open_dispute(
        self,
        claimant: Address,
        respondent: Address,
        claimant_cid: str,
        scope_cid: str,
    ) -> u64:
        claimant_str = self._addr_to_str(claimant)
        respondent_str = self._addr_to_str(respondent)

        if gl.message.value == u256(0):
            raise gl.vm.UserError("escrow stake is required")

        if claimant_str == ZERO_ADDRESS:
            raise gl.vm.UserError("claimant address is required")

        if respondent_str == ZERO_ADDRESS:
            raise gl.vm.UserError("respondent address is required")

        if claimant_str == respondent_str:
            raise gl.vm.UserError("claimant and respondent must differ")

        if not self._valid_cid(claimant_cid):
            raise gl.vm.UserError("valid claimant evidence CID is required")

        if scope_cid != "" and not self._valid_cid(scope_cid):
            raise gl.vm.UserError("scope CID is invalid")

        now = _now_seconds()

        self.next_dispute_id = self.next_dispute_id + u64(1)
        dispute_id = self.next_dispute_id
        dispute_key = self._u64_key(dispute_id)

        self.disputes[dispute_key] = Dispute(
            id=dispute_id,
            claimant=claimant_str,
            respondent=respondent_str,
            claimant_cid=claimant_cid,
            respondent_cid="",
            scope_cid=scope_cid,
            status=STATUS_PENDING_RESPONSE,
            stake=gl.message.value,
            created_at=now,
            response_deadline=now + self.response_window_seconds,
            appeal_deadline=u64(0),
            settled=False,
            settled_at=u64(0),
            claimant_paid=u256(0),
            respondent_paid=u256(0),
            verdict=_empty_verdict(),
        )

        self.dispute_exists[dispute_key] = True

        self._append_history(claimant_str, dispute_id)
        self._append_history(respondent_str, dispute_id)

        return dispute_id

    @gl.public.write
    def submit_response(self, dispute_id: u64, respondent_cid: str) -> None:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        dispute = self.disputes[dispute_key]

        if self._sender() != dispute.respondent:
            raise gl.vm.UserError("only respondent can submit counter-evidence")

        if dispute.status != STATUS_PENDING_RESPONSE:
            raise gl.vm.UserError("response is not open")

        if _now_seconds() > dispute.response_deadline:
            raise gl.vm.UserError("response window closed")

        if not self._valid_cid(respondent_cid):
            raise gl.vm.UserError("valid respondent evidence CID is required")

        dispute.respondent_cid = respondent_cid
        dispute.status = STATUS_READY

        self.disputes[dispute_key] = dispute

    @gl.public.write
    def evaluate_dispute(self, dispute_id: u64) -> None:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        storage_dispute = self.disputes[dispute_key]

        if storage_dispute.status not in (STATUS_PENDING_RESPONSE, STATUS_READY):
            raise gl.vm.UserError("dispute cannot be evaluated")

        if storage_dispute.status == STATUS_PENDING_RESPONSE:
            if _now_seconds() <= storage_dispute.response_deadline:
                raise gl.vm.UserError("response window still open")

        dispute = gl.storage.copy_to_memory(storage_dispute)

        def fetch_ipfs(cid: str) -> str:
            if cid == "":
                return "No evidence submitted."

            response = gl.nondet.web.request(
                "https://w3s.link/ipfs/" + cid,
                method="GET",
            )

            if response.status_code >= 400:
                raise gl.vm.UserError("evidence CID could not be fetched")

            text = response.body.decode("utf-8")

            if text == "":
                raise gl.vm.UserError("evidence CID returned empty content")

            return text[:12000]

        def leader_fn():
            scope_text = fetch_ipfs(dispute.scope_cid)
            claimant_text = fetch_ipfs(dispute.claimant_cid)
            respondent_text = fetch_ipfs(dispute.respondent_cid)

            prompt = f"""
You are a neutral on-chain arbitrator for Disputr.

Evaluate the dispute objectively using only the supplied scope, evidence, and metadata.

Scope document:
{scope_text}

Claimant evidence:
{claimant_text}

Respondent evidence:
{respondent_text}

Claimant:
{dispute.claimant}

Respondent:
{dispute.respondent}

Escrowed stake wei:
{dispute.stake}

Rules:
- Use only the supplied evidence.
- Do not invent facts.
- If respondent gave no response, judge based on claimant evidence and scope.
- If both sides are partly correct, use winner "split".
- split_ratio means the claimant share of the escrowed amount.
- If winner is claimant, split_ratio should be 1.0.
- If winner is respondent, split_ratio should be 0.0.
- If winner is split, split_ratio should be between 0.0 and 1.0.
- confidence must be between 0.0 and 1.0.
- claimant_weight and respondent_weight must each be between 0.0 and 1.0.

Return only JSON with exactly these fields:
{{
  "winner": "claimant" | "respondent" | "split",
  "split_ratio": 0.0,
  "confidence": 0.0,
  "reasoning": "concise verdict reasoning",
  "claimant_weight": 0.0,
  "respondent_weight": 0.0,
  "reasoning_trace": "compact semicolon-separated trace of evidence considered"
}}
"""

            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leader_result) -> bool:
            if isinstance(leader_result, gl.vm.UserError):
                return True

            if not isinstance(leader_result, gl.vm.Return):
                return False

            return _valid_verdict(leader_result.calldata)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        storage_dispute.verdict = Verdict(
            winner=str(result["winner"]),
            split_ratio_bps=_to_bps(result.get("split_ratio", 0)),
            confidence_bps=_to_bps(result["confidence"]),
            reasoning=str(result["reasoning"])[:4000],
            claimant_weight_bps=_to_bps(result["claimant_weight"]),
            respondent_weight_bps=_to_bps(result["respondent_weight"]),
            reasoning_trace=str(result.get("reasoning_trace", ""))[:4000],
        )

        if storage_dispute.verdict.winner == WINNER_CLAIMANT:
            storage_dispute.verdict.split_ratio_bps = u32(10000)

        if storage_dispute.verdict.winner == WINNER_RESPONDENT:
            storage_dispute.verdict.split_ratio_bps = u32(0)

        storage_dispute.status = STATUS_RESOLVED
        storage_dispute.appeal_deadline = _now_seconds() + self.appeal_window_seconds

        self.disputes[dispute_key] = storage_dispute

    @gl.public.write.payable
    def file_appeal(self, dispute_id: u64, appeal_cid: str) -> None:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        dispute = self.disputes[dispute_key]

        if dispute.status != STATUS_RESOLVED:
            raise gl.vm.UserError("only resolved disputes can be appealed")

        if _now_seconds() > dispute.appeal_deadline:
            raise gl.vm.UserError("appeal window closed")

        if gl.message.value < self.minimum_appeal_stake:
            raise gl.vm.UserError("appeal stake below minimum")

        if not self._valid_cid(appeal_cid):
            raise gl.vm.UserError("valid appeal evidence CID is required")

        self.appeals[dispute_key] = AppealRecord(
            dispute_id=dispute_id,
            appellant=self._sender(),
            stake=gl.message.value,
            evidence_cid=appeal_cid,
            status=APPEAL_PENDING,
            opened_at=_now_seconds(),
        )

        self.appeal_exists[dispute_key] = True

        dispute.status = STATUS_APPEALED
        self.disputes[dispute_key] = dispute

    @gl.public.write
    def mark_appeal_resolved(
        self,
        dispute_id: u64,
        winner: str,
        split_ratio_bps: u32,
        reasoning: str,
    ) -> None:
        self._only_owner()
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)

        if not self.appeal_exists.get(dispute_key, False):
            raise gl.vm.UserError("appeal not found")

        dispute = self.disputes[dispute_key]

        if dispute.status != STATUS_APPEALED:
            raise gl.vm.UserError("dispute is not appealed")

        if winner not in (WINNER_CLAIMANT, WINNER_RESPONDENT, WINNER_SPLIT):
            raise gl.vm.UserError("invalid appeal winner")

        if split_ratio_bps > u32(10000):
            raise gl.vm.UserError("split ratio too high")

        dispute.verdict.winner = winner

        if winner == WINNER_CLAIMANT:
            dispute.verdict.split_ratio_bps = u32(10000)
        elif winner == WINNER_RESPONDENT:
            dispute.verdict.split_ratio_bps = u32(0)
        else:
            dispute.verdict.split_ratio_bps = split_ratio_bps

        dispute.verdict.reasoning = reasoning[:4000]
        dispute.status = STATUS_RESOLVED
        dispute.appeal_deadline = _now_seconds()

        self.disputes[dispute_key] = dispute

        appeal = self.appeals[dispute_key]
        appeal.status = APPEAL_RESOLVED
        self.appeals[dispute_key] = appeal

    @gl.public.write
    def release_escrow(self, dispute_id: u64) -> None:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        dispute = self.disputes[dispute_key]

        if dispute.settled:
            raise gl.vm.UserError("escrow already settled")

        if dispute.status != STATUS_RESOLVED:
            raise gl.vm.UserError("dispute is not resolved")

        if _now_seconds() <= dispute.appeal_deadline:
            raise gl.vm.UserError("appeal window still open")

        if dispute.stake == u256(0):
            raise gl.vm.UserError("no escrow to release")

        claimant_amount = u256(0)
        respondent_amount = u256(0)

        if dispute.verdict.winner == WINNER_CLAIMANT:
            claimant_amount = dispute.stake

        elif dispute.verdict.winner == WINNER_RESPONDENT:
            respondent_amount = dispute.stake

        elif dispute.verdict.winner == WINNER_SPLIT:
            claimant_amount = self._amount_from_bps(
                dispute.stake,
                dispute.verdict.split_ratio_bps,
            )
            respondent_amount = dispute.stake - claimant_amount

        else:
            raise gl.vm.UserError("invalid verdict winner")

        dispute.settled = True
        dispute.settled_at = _now_seconds()
        dispute.claimant_paid = claimant_amount
        dispute.respondent_paid = respondent_amount
        dispute.status = STATUS_SETTLED

        self.disputes[dispute_key] = dispute

        self._send_value(dispute.claimant, claimant_amount)
        self._send_value(dispute.respondent, respondent_amount)

    @gl.public.view
    def get_dispute(self, dispute_id: u64) -> typing.Any:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        dispute = self.disputes[dispute_key]

        return {
            "id": dispute.id,
            "claimant": dispute.claimant,
            "respondent": dispute.respondent,
            "claimant_cid": dispute.claimant_cid,
            "respondent_cid": dispute.respondent_cid,
            "scope_cid": dispute.scope_cid,
            "status": dispute.status,
            "stake": dispute.stake,
            "created_at": dispute.created_at,
            "response_deadline": dispute.response_deadline,
            "appeal_deadline": dispute.appeal_deadline,
            "settled": dispute.settled,
            "settled_at": dispute.settled_at,
            "claimant_paid": dispute.claimant_paid,
            "respondent_paid": dispute.respondent_paid,
            "verdict": {
                "winner": dispute.verdict.winner,
                "split_ratio_bps": dispute.verdict.split_ratio_bps,
                "confidence_bps": dispute.verdict.confidence_bps,
                "reasoning": dispute.verdict.reasoning,
                "claimant_weight_bps": dispute.verdict.claimant_weight_bps,
                "respondent_weight_bps": dispute.verdict.respondent_weight_bps,
                "reasoning_trace": dispute.verdict.reasoning_trace,
            },
        }

    @gl.public.view
    def preview_payout(self, dispute_id: u64) -> typing.Any:
        self._require_dispute_exists(dispute_id)

        dispute_key = self._u64_key(dispute_id)
        dispute = self.disputes[dispute_key]

        claimant_amount = u256(0)
        respondent_amount = u256(0)

        if dispute.verdict.winner == WINNER_CLAIMANT:
            claimant_amount = dispute.stake

        elif dispute.verdict.winner == WINNER_RESPONDENT:
            respondent_amount = dispute.stake

        elif dispute.verdict.winner == WINNER_SPLIT:
            claimant_amount = self._amount_from_bps(
                dispute.stake,
                dispute.verdict.split_ratio_bps,
            )
            respondent_amount = dispute.stake - claimant_amount

        return {
            "claimant": dispute.claimant,
            "respondent": dispute.respondent,
            "claimant_amount": claimant_amount,
            "respondent_amount": respondent_amount,
            "winner": dispute.verdict.winner,
            "split_ratio_bps": dispute.verdict.split_ratio_bps,
            "settled": dispute.settled,
        }

    @gl.public.view
    def get_appeal(self, dispute_id: u64) -> typing.Any:
        dispute_key = self._u64_key(dispute_id)

        if not self.appeal_exists.get(dispute_key, False):
            raise gl.vm.UserError("appeal not found")

        appeal = self.appeals[dispute_key]

        return {
            "dispute_id": appeal.dispute_id,
            "appellant": appeal.appellant,
            "stake": appeal.stake,
            "evidence_cid": appeal.evidence_cid,
            "status": appeal.status,
            "opened_at": appeal.opened_at,
        }

    @gl.public.view
    def has_appeal(self, dispute_id: u64) -> bool:
        dispute_key = self._u64_key(dispute_id)

        return self.appeal_exists.get(dispute_key, False)

    @gl.public.view
    def get_history(self, wallet: Address) -> typing.Any:
        wallet_str = self._addr_to_str(wallet)
        csv = self.history.get(wallet_str, "")

        return self._csv_to_u64_list(csv)

    @gl.public.view
    def get_history_raw(self, wallet: Address) -> str:
        wallet_str = self._addr_to_str(wallet)

        return self.history.get(wallet_str, "")

    @gl.public.view
    def total_disputes(self) -> u64:
        return self.next_dispute_id

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def get_minimum_appeal_stake(self) -> u256:
        return self.minimum_appeal_stake

    @gl.public.view
    def get_windows(self) -> typing.Any:
        return {
            "response_window_seconds": self.response_window_seconds,
            "appeal_window_seconds": self.appeal_window_seconds,
        }

    @gl.public.view
    def contract_balance(self) -> u256:
        return self.balance