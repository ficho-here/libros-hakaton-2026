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
  votes: BN[];
  totalVotes: BN;
  createdAt: BN;
  bump: number;
};

export type VoteAccount = {
  publicKey: string;
  voter: PublicKey;
  poll: PublicKey;
  optionIndex: number;
  timestamp: BN;
  bump: number;
};

export type PollWithPublicKey = PollAccount & {
  publicKey: string;
};

type ProgramAccount<T> = {
  account: T;
  publicKey: PublicKey;
};

type AnchorWalletLike = {
  publicKey: PublicKey;
  signTransaction: NonNullable<WalletContextState["signTransaction"]>;
  signAllTransactions: NonNullable<WalletContextState["signAllTransactions"]>;
};

function requireAnchorWallet(wallet: WalletContextState): AnchorWalletLike {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Please connect Phantom wallet first.");
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions
  };
}

function getTotalStringBytes(values: string[]) {
  return values.reduce((sum, value) => sum + new TextEncoder().encode(value).length, 0);
}

export function getProgram(connection: Connection, wallet?: WalletContextState) {
  const anchorWallet = wallet?.publicKey ? requireAnchorWallet(wallet) : undefined;
  const provider = new AnchorProvider(
    connection,
    anchorWallet ?? ({} as AnchorWalletLike),
    AnchorProvider.defaultOptions()
  );
  const programIdl = { ...(idl as unknown as Idl), address: PROGRAM_ID.toBase58() } as Idl;

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
  const cleanedTitle = title.trim();
  const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);

  if (!cleanedTitle) {
    throw new Error("Poll title cannot be empty.");
  }

  if (new TextEncoder().encode(cleanedTitle).length > 80) {
    throw new Error("Poll title is too long.");
  }

  if (cleanedOptions.length < 2) {
    throw new Error("Add at least two options.");
  }

  if (cleanedOptions.length > 10) {
    throw new Error("A poll can have at most ten options.");
  }

  if (cleanedOptions.some((option) => new TextEncoder().encode(option).length > 40)) {
    throw new Error("Each option must be 40 characters or fewer.");
  }

  if (getTotalStringBytes(cleanedOptions) === 0) {
    throw new Error("Poll options cannot be empty.");
  }

  const [pollPda] = findPollPda(anchorWallet.publicKey, pollId);

  const signature = await program.methods
    .createPoll(pollId, cleanedTitle, cleanedOptions)
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

  const accounts = (await program.account.poll.all()) as ProgramAccount<PollAccount>[];
  const polls = accounts.map((account) => ({
    ...account.account,
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
  const votes = (await program.account.vote.all()) as ProgramAccount<Omit<VoteAccount, "publicKey">>[];

  return votes
    .map((account) => ({
      ...account.account,
      publicKey: account.publicKey.toBase58()
    }))
    .filter((vote) => vote.poll.equals(key));
}
