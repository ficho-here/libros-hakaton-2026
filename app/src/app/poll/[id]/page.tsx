"use client";

import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VotePanel } from "@/components/VotePanel";
import { WalletButton } from "@/components/WalletButton";
import { PollAccount, VoteAccount } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";

export default function PollDetailsPage({ params }: { params: { id: string } }) {
  const pollPublicKey = useMemo(() => new PublicKey(params.id), [params.id]);
  const { fetchPoll, fetchVotesForPoll } = useVotingProgram();
  const [poll, setPoll] = useState<PollAccount | null>(null);
  const [votes, setVotes] = useState<VoteAccount[]>([]);
  const [status, setStatus] = useState("Loading poll...");

  async function refresh() {
    try {
      setStatus("Loading poll...");
      const [pollAccount, voteAccounts] = await Promise.all([
        fetchPoll(pollPublicKey),
        fetchVotesForPoll(pollPublicKey)
      ]);
      setPoll(pollAccount);
      setVotes(voteAccounts);
      setStatus("");
    } catch (error) {
      setStatus("Could not load this poll. Check the poll address, program ID, and copied IDL.");
    }
  }

  useEffect(() => {
    refresh();
  }, [pollPublicKey.toBase58()]);

  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-neon">
              Back to polls
            </Link>
            <h1 className="mt-3 text-4xl font-black text-white">{poll?.title ?? "GOTY poll"}</h1>
            <p className="mt-2 break-all text-sm text-slate-400">Poll account: {params.id}</p>
          </div>
          <WalletButton />
        </header>

        {status && <p className="rounded-lg border border-slate-800 bg-panel p-5 text-slate-300">{status}</p>}
        {poll && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <VotePanel pollPublicKey={pollPublicKey} poll={poll} onVoted={refresh} />
            <ResultsPanel poll={poll} votes={votes} onRefresh={refresh} />
          </div>
        )}
      </div>
    </main>
  );
}
