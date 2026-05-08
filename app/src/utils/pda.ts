import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@/utils/constants";

function pollIdToLittleEndianBytes(pollId: BN) {
  return new Uint8Array(pollId.toArray("le", 8));
}

export function findPollPda(creator: PublicKey, pollId: BN) {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("poll"), creator.toBuffer(), pollIdToLittleEndianBytes(pollId)],
    PROGRAM_ID
  );
}

export function findVotePda(poll: PublicKey, voter: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("vote"), poll.toBuffer(), voter.toBuffer()],
    PROGRAM_ID
  );
}
