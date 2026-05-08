"use client";

import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import idl from "@/idl/goty_voting.json";
import { PROGRAM_ID } from "@/utils/constants";
import { findPollPda, findVotePda } from "@/utils/pda";

export type PollOption = {
  id: string;
  label: string;
  index: number;
};

export type PollDetails = {
  id: string;
  publicKey?: string;
  question: string;
  options: PollOption[];
  creator?: string;
  createdAt?: number;
};

export type VoterRecord = {
  walletAddress: string;
  optionId: string;
  optionLabel: string;
  votedAt?: number;
  voteAccount?: string;
};

export type PollOptionResult = PollOption & {
  voteCount: number;
};

export type PollResults = {
  pollId: string;
  optionResults: PollOptionResult[];
  totalVotes: number;
  voters: VoterRecord[];
};

export type VoteErrorCode = "DUPLICATE_VOTE" | "WALLET_NOT_CONNECTED" | "INVALID_OPTION" | "UNKNOWN";

export class VoteError extends Error {
  code: VoteErrorCode;
  rawError?: unknown;

  constructor(message: string, code: VoteErrorCode = "UNKNOWN", rawError?: unknown) {
    super(message);
    this.name = "VoteError";
    this.code = code;
    this.rawError = rawError;
  }
}

export class DuplicateVoteError extends VoteError {
  constructor(rawError?: unknown) {
    super("This wallet has already voted in this poll.", "DUPLICATE_VOTE", rawError);
    this.name = "DuplicateVoteError";
  }
}

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

type VotingServiceContext = {
  connection?: Connection;
  wallet?: WalletContextState;
};

const MOCK_POLL_ID = "demo-poll";
const mockVotesByPoll = new Map<string, VoterRecord[]>();

function getMockPoll(pollId: string): PollDetails {
  return {
    id: pollId,
    question: "Which game deserves the hackathon Game of the Year vote?",
    options: [
      { id: "0", label: "Baldur's Gate 3", index: 0 },
      { id: "1", label: "Alan Wake 2", index: 1 },
      { id: "2", label: "The Legend of Zelda: Tears of the Kingdom", index: 2 },
      { id: "3", label: "Marvel's Spider-Man 2", index: 3 }
    ]
  };
}

function getMockVotes(pollId: string) {
  if (!mockVotesByPoll.has(pollId)) {
    mockVotesByPoll.set(pollId, [
      {
        walletAddress: "9sQeR8ZqmkF8VMf9JycTqP9Dnq5dZUz94t2ddCAb1demo",
        optionId: "0",
        optionLabel: "Baldur's Gate 3",
        votedAt: Date.now() - 1000 * 60 * 12
      },
      {
        walletAddress: "3xS4JfoX9xLzMhL1Rq2n5dZ7G6G6t91WQG8jNQqdemo",
        optionId: "2",
        optionLabel: "The Legend of Zelda: Tears of the Kingdom",
        votedAt: Date.now() - 1000 * 60 * 5
      }
    ]);
  }

  return mockVotesByPoll.get(pollId) ?? [];
}

function isLikelyPublicKey(value: string) {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function optionIdToIndex(optionId: string) {
  const index = Number(optionId);
  return Number.isInteger(index) && index >= 0 ? index : -1;
}

function mapPollAccountToDetails(pollId: string, poll: PollAccount): PollDetails {
  return {
    id: pollId,
    publicKey: pollId,
    question: poll.title,
    options: poll.options.map((label, index) => ({ id: String(index), label, index })),
    creator: poll.creator.toBase58(),
    createdAt: poll.createdAt.toNumber()
  };
}

function mapPollAndVotesToResults(pollId: string, poll: PollAccount, votes: VoteAccount[]): PollResults {
  const optionResults = poll.options.map((label, index) => ({
    id: String(index),
    label,
    index,
    voteCount: poll.voteCounts[index]?.toNumber() ?? 0
  }));

  return {
    pollId,
    optionResults,
    totalVotes: poll.totalVotes.toNumber(),
    voters: votes.map((vote) => {
      const option = optionResults[vote.optionIndex];

      return {
        walletAddress: vote.voter.toBase58(),
        optionId: String(vote.optionIndex),
        optionLabel: option?.label ?? `Option ${vote.optionIndex + 1}`,
        votedAt: vote.votedAt.toNumber(),
        voteAccount: vote.publicKey
      };
    })
  };
}

function buildMockResults(pollId: string): PollResults {
  const poll = getMockPoll(pollId);
  const voters = getMockVotes(pollId);
  const optionResults = poll.options.map((option) => ({
    ...option,
    voteCount: voters.filter((vote) => vote.optionId === option.id).length
  }));

  return {
    pollId,
    optionResults,
    totalVotes: voters.length,
    voters
  };
}

export function isDuplicateVoteError(error: unknown) {
  if (error instanceof DuplicateVoteError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /already voted|already in use|custom program error: 0x0|duplicate/i.test(message);
}

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

export async function getPollDetails(
  pollId: string = MOCK_POLL_ID,
  context: VotingServiceContext = {}
): Promise<PollDetails> {
  if (context.connection && isLikelyPublicKey(pollId)) {
    try {
      // TODO: Replace this adapter with the final Anchor IDL/program account shape if it changes.
      const poll = await fetchPoll(context.connection, pollId);
      return mapPollAccountToDetails(pollId, poll);
    } catch (error) {
      console.warn("Falling back to mock poll details until the on-chain poll fetch is ready.", error);
    }
  }

  return getMockPoll(pollId);
}

export async function getPollResults(
  pollId: string = MOCK_POLL_ID,
  context: VotingServiceContext = {}
): Promise<PollResults> {
  if (context.connection && isLikelyPublicKey(pollId)) {
    try {
      // TODO: Replace voteRecord scanning with indexed/program-specific queries when the backend is finalized.
      const [poll, votes] = await Promise.all([
        fetchPoll(context.connection, pollId),
        fetchVotesForPoll(context.connection, pollId)
      ]);
      return mapPollAndVotesToResults(pollId, poll, votes);
    } catch (error) {
      console.warn("Falling back to mock poll results until the on-chain results fetch is ready.", error);
    }
  }

  return buildMockResults(pollId);
}

export async function submitVote(
  pollId: string,
  optionId: string,
  walletAddress: string,
  context: VotingServiceContext = {}
): Promise<void> {
  if (!walletAddress) {
    throw new VoteError("Connect a wallet before voting.", "WALLET_NOT_CONNECTED");
  }

  const optionIndex = optionIdToIndex(optionId);
  if (optionIndex < 0) {
    throw new VoteError("Choose a valid option before voting.", "INVALID_OPTION");
  }

  if (context.connection && context.wallet?.publicKey && isLikelyPublicKey(pollId)) {
    try {
      // TODO: Wire this to the final Anchor program method/IDL once the contract settles.
      await vote(context.connection, context.wallet, new PublicKey(pollId), optionIndex);
      return;
    } catch (error) {
      if (isDuplicateVoteError(error)) {
        throw new DuplicateVoteError(error);
      }

      throw new VoteError("Vote transaction failed. Please try again.", "UNKNOWN", error);
    }
  }

  const poll = getMockPoll(pollId);
  const option = poll.options.find((item) => item.id === optionId);
  if (!option) {
    throw new VoteError("Choose a valid option before voting.", "INVALID_OPTION");
  }

  const votes = getMockVotes(pollId);
  if (votes.some((record) => record.walletAddress === walletAddress)) {
    throw new DuplicateVoteError();
  }

  votes.push({
    walletAddress,
    optionId,
    optionLabel: option.label,
    votedAt: Date.now()
  });
}
