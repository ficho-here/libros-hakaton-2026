"use client";

import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import idl from "@/idl/goty_voting.json";
import { PROGRAM_ID } from "@/utils/constants";
import { findPollPda, findVotePda } from "@/utils/pda";

export type PollAccount = {
  pollId: BN;
  creator: PublicKey;
  title: string;
  options: string[];
  voteCounts: BN[];
  totalVotes: BN;
  createdAt: BN;
  bump: number;
};

export type VoteAccount = {
  publicKey: string;
  voter: PublicKey;
  poll: PublicKey;
  pollId: BN;
  optionIndex: number;
  votedAt: BN;
  bump: number;
};

export type PollWithPublicKey = PollAccount & {
  publicKey: string;
};

type AnchorWalletLike = {
  publicKey: PublicKey;
  signTransaction: NonNullable<WalletContextState["signTransaction"]>;
  signAllTransactions: NonNullable<WalletContextState["signAllTransactions"]>;
};

function requireAnchorWallet(wallet: WalletContextState): AnchorWalletLike {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Connect Phantom wallet first.");
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions
  };
}

export function getProgram(connection: Connection, wallet?: WalletContextState) {
  const anchorWallet = wallet?.publicKey ? requireAnchorWallet(wallet) : undefined;
  const provider = new AnchorProvider(
    connection,
    anchorWallet ?? ({} as AnchorWalletLike),
    AnchorProvider.defaultOptions()
  );
  const programIdl = { ...(idl as Idl), address: PROGRAM_ID.toBase58() } as Idl;

  return new Program(programIdl, provider) as any;
}

export async function createPoll(
  connection: Connection,
  wallet: WalletContextState,
  title: string,
  options: string[]
) {
  const anchorWallet = requireAnchorWallet(wallet);
  const program = getProgram(connection, wallet);
  const pollId = new BN(Date.now());
  const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);
  const [pollPda] = findPollPda(anchorWallet.publicKey, pollId);

  const signature = await program.methods
    .createPoll(pollId, title.trim(), cleanedOptions)
    .accounts({
      poll: pollPda,
      creator: anchorWallet.publicKey,
      systemProgram: SystemProgram.programId
    })
    .rpc();

  return { pollPda, pollId, signature };
}

export async function vote(
  connection: Connection,
  wallet: WalletContextState,
  pollPublicKey: PublicKey,
  optionIndex: number
) {
  const anchorWallet = requireAnchorWallet(wallet);
  const program = getProgram(connection, wallet);
  const [votePda] = findVotePda(pollPublicKey, anchorWallet.publicKey);

  return program.methods
    .vote(optionIndex)
    .accounts({
      poll: pollPublicKey,
      vote: votePda,
      voter: anchorWallet.publicKey,
      systemProgram: SystemProgram.programId
    })
    .rpc();
}

export async function fetchPoll(connection: Connection, pollPublicKey: PublicKey | string) {
  const program = getProgram(connection);
  const key = typeof pollPublicKey === "string" ? new PublicKey(pollPublicKey) : pollPublicKey;
  return (await program.account.poll.fetch(key)) as PollAccount;
}

export async function fetchAllPolls(connection: Connection, creator?: PublicKey) {
  const program = getProgram(connection);

  // Beginner note:
  // account.all() is convenient for hackathons. For large apps you would add
  // pagination/indexing, but this keeps Devnet development easy.
  const accounts = await program.account.poll.all();
  const polls = accounts.map((account) => ({
    ...((account.account as unknown) as PollAccount),
    publicKey: account.publicKey.toBase58()
  }));

  if (!creator) {
    return polls;
  }

  return polls.filter((poll) => poll.creator.equals(creator));
}

export async function fetchVotesForPoll(connection: Connection, pollPublicKey: PublicKey | string) {
  const program = getProgram(connection);
  const key = typeof pollPublicKey === "string" ? new PublicKey(pollPublicKey) : pollPublicKey;
  const votes = await program.account.voteRecord.all();

  return votes
    .map((account) => ({
      ...((account.account as unknown) as Omit<VoteAccount, "publicKey">),
      publicKey: account.publicKey.toBase58()
    }))
    .filter((vote) => vote.poll.equals(key));
}
