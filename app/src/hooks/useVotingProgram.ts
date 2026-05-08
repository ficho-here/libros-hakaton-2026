"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createPoll as createPollService,
  fetchAllPolls as fetchAllPollsService,
  fetchPoll as fetchPollService,
  fetchVotesForPoll as fetchVotesForPollService,
  vote as voteService
} from "@/services/votingService";

export function useVotingProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return {
    createPoll: (title: string, options: string[]) => createPollService(connection, wallet, title, options),
    vote: (pollPublicKey: Parameters<typeof voteService>[2], optionIndex: number) =>
      voteService(connection, wallet, pollPublicKey, optionIndex),
    fetchPoll: (pollPublicKey: Parameters<typeof fetchPollService>[1]) =>
      fetchPollService(connection, pollPublicKey),
    fetchAllPolls: () => fetchAllPollsService(connection),
    fetchVotesForPoll: (pollPublicKey: Parameters<typeof fetchVotesForPollService>[1]) =>
      fetchVotesForPollService(connection, pollPublicKey)
  };
}
