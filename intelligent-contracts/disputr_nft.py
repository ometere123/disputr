# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
from genlayer import *
import typing


ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


@allow_storage
@dataclass
class Credential:
    token_id: u64
    dispute_id: u64
    owner: str
    metadata_hash: str
    outcome: str
    minted_at: str


class Contract(gl.Contract):
    owner: str
    arbitrator: str
    next_token_id: u64

    # token_id string -> Credential
    tokens: TreeMap[str, Credential]

    # wallet string -> comma-separated token IDs, e.g. "1,4,7"
    wallet_tokens: TreeMap[str, str]

    # dispute_id string -> comma-separated token IDs, e.g. "1,2"
    dispute_tokens: TreeMap[str, str]

    # dispute_id string -> bool
    dispute_minted: TreeMap[str, bool]

    def __init__(self) -> None:
        deployer = str(gl.message.sender_address)

        self.owner = deployer
        self.arbitrator = deployer
        self.next_token_id = u64(0)

        # IMPORTANT:
        # Do NOT initialise TreeMap fields here.
        # GenLayer zero-initialises persistent storage fields automatically.

    def _sender(self) -> str:
        return str(gl.message.sender_address)

    def _addr_to_str(self, addr: Address) -> str:
        return str(addr)

    def _u64_key(self, value: u64) -> str:
        return str(value)

    def _only_owner(self) -> None:
        if self._sender() != self.owner:
            raise gl.vm.UserError("only owner")

    def _only_minter(self) -> None:
        sender = self._sender()

        if sender != self.arbitrator and sender != self.owner:
            raise gl.vm.UserError("only arbitrator or owner can mint credentials")

    def _require_token_exists(self, token_id: u64) -> None:
        if token_id == u64(0) or token_id > self.next_token_id:
            raise gl.vm.UserError("credential does not exist")

    def _append_token_to_wallet(self, wallet: str, token_id: u64) -> None:
        current = self.wallet_tokens.get(wallet, "")

        if current == "":
            self.wallet_tokens[wallet] = str(token_id)
        else:
            self.wallet_tokens[wallet] = current + "," + str(token_id)

    def _append_token_to_dispute(self, dispute_id: u64, token_id: u64) -> None:
        dispute_key = self._u64_key(dispute_id)
        current = self.dispute_tokens.get(dispute_key, "")

        if current == "":
            self.dispute_tokens[dispute_key] = str(token_id)
        else:
            self.dispute_tokens[dispute_key] = current + "," + str(token_id)

    def _csv_to_u64_list(self, csv: str) -> typing.Any:
        if csv == "":
            return []

        parts = csv.split(",")
        items = []

        for part in parts:
            if part != "":
                items.append(u64(int(part)))

        return items

    def _mint(
        self,
        to: Address,
        dispute_id: u64,
        metadata_hash: str,
        outcome: str,
    ) -> u64:
        to_wallet = self._addr_to_str(to)

        if to_wallet == ZERO_ADDRESS:
            raise gl.vm.UserError("recipient address is required")

        self.next_token_id = self.next_token_id + u64(1)
        token_id = self.next_token_id
        token_key = self._u64_key(token_id)

        credential = Credential(
            token_id=token_id,
            dispute_id=dispute_id,
            owner=to_wallet,
            metadata_hash=metadata_hash,
            outcome=outcome,
            minted_at=gl.message_raw["datetime"],
        )

        self.tokens[token_key] = credential

        self._append_token_to_wallet(to_wallet, token_id)
        self._append_token_to_dispute(dispute_id, token_id)

        return token_id

    @gl.public.write
    def set_arbitrator(self, new_arbitrator: Address) -> None:
        self._only_owner()

        new_arbitrator_str = self._addr_to_str(new_arbitrator)

        if new_arbitrator_str == ZERO_ADDRESS:
            raise gl.vm.UserError("arbitrator address is required")

        self.arbitrator = new_arbitrator_str

    @gl.public.write
    def mint_case_credentials(
        self,
        dispute_id: u64,
        claimant: Address,
        respondent: Address,
        metadata_hash: str,
        outcome: str,
    ) -> typing.Any:
        self._only_minter()

        if dispute_id == u64(0):
            raise gl.vm.UserError("dispute id is required")

        claimant_str = self._addr_to_str(claimant)
        respondent_str = self._addr_to_str(respondent)

        if claimant_str == ZERO_ADDRESS:
            raise gl.vm.UserError("claimant address is required")

        if respondent_str == ZERO_ADDRESS:
            raise gl.vm.UserError("respondent address is required")

        if claimant_str == respondent_str:
            raise gl.vm.UserError("claimant and respondent cannot be the same wallet")

        if metadata_hash == "":
            raise gl.vm.UserError("metadata hash is required")

        if outcome == "":
            raise gl.vm.UserError("outcome is required")

        dispute_key = self._u64_key(dispute_id)

        if self.dispute_minted.get(dispute_key, False):
            raise gl.vm.UserError("credentials already minted for this dispute")

        claimant_token = self._mint(claimant, dispute_id, metadata_hash, outcome)
        respondent_token = self._mint(respondent, dispute_id, metadata_hash, outcome)

        self.dispute_minted[dispute_key] = True

        return {
            "claimant_token_id": claimant_token,
            "respondent_token_id": respondent_token,
        }

    @gl.public.write
    def transfer(self, to: Address, token_id: u64) -> None:
        raise gl.vm.UserError("Disputr credentials are soulbound and non-transferable")

    @gl.public.write
    def approve(self, spender: Address, token_id: u64) -> None:
        raise gl.vm.UserError("Disputr credentials are soulbound and non-transferable")

    @gl.public.view
    def owner_of(self, token_id: u64) -> str:
        self._require_token_exists(token_id)

        token_key = self._u64_key(token_id)
        credential = self.tokens[token_key]

        return credential.owner

    @gl.public.view
    def token_metadata(self, token_id: u64) -> typing.Any:
        self._require_token_exists(token_id)

        token_key = self._u64_key(token_id)
        credential = self.tokens[token_key]

        return {
            "token_id": credential.token_id,
            "dispute_id": credential.dispute_id,
            "owner": credential.owner,
            "metadata_hash": credential.metadata_hash,
            "outcome": credential.outcome,
            "minted_at": credential.minted_at,
        }

    @gl.public.view
    def credentials_of(self, wallet: Address) -> typing.Any:
        wallet_str = self._addr_to_str(wallet)
        csv = self.wallet_tokens.get(wallet_str, "")

        return self._csv_to_u64_list(csv)

    @gl.public.view
    def credentials_of_raw(self, wallet: Address) -> str:
        wallet_str = self._addr_to_str(wallet)

        return self.wallet_tokens.get(wallet_str, "")

    @gl.public.view
    def credentials_for_dispute(self, dispute_id: u64) -> typing.Any:
        dispute_key = self._u64_key(dispute_id)
        csv = self.dispute_tokens.get(dispute_key, "")

        return self._csv_to_u64_list(csv)

    @gl.public.view
    def credentials_for_dispute_raw(self, dispute_id: u64) -> str:
        dispute_key = self._u64_key(dispute_id)

        return self.dispute_tokens.get(dispute_key, "")

    @gl.public.view
    def has_minted_for_dispute(self, dispute_id: u64) -> bool:
        dispute_key = self._u64_key(dispute_id)

        return self.dispute_minted.get(dispute_key, False)

    @gl.public.view
    def total_supply(self) -> u64:
        return self.next_token_id

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def get_arbitrator(self) -> str:
        return self.arbitrator