"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { PollCard } from "@/components/PollCard";
import { PollWithPublicKey } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";

export default function HomePage() {
  const { fetchAllPolls } = useVotingProgram();
  const [polls, setPolls] = useState<PollWithPublicKey[]>([]);
  const [status, setStatus] = useState("Loading polls...");

  async function loadPolls() {
    try {
      setStatus("Loading polls...");
      const allPolls = await fetchAllPolls();
      setPolls(allPolls);
      setStatus(allPolls.length === 0 ? "No polls yet. Create the first GOTY battle." : "");
    } catch (error) {
      setStatus("Could not load polls. Build/deploy the program and copy the IDL into the app.");
    }
  }

  useEffect(() => {
    loadPolls();
  }, []);

  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-trophy">Solana Devnet Awards</p>
            <h1 className="mt-2 text-4xl font-black text-white sm:text-6xl">GOTY ChainVote</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Connect Phantom, create a Game of the Year poll, and record every vote on-chain.
            </p>
          </div>
          <WalletButton />
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black text-white">Live polls</h2>
          <div className="flex gap-3">
            <button
              onClick={loadPolls}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-bold text-white hover:border-neon"
            >
              Refresh
            </button>
            <Link href="/create" className="rounded-md bg-neon px-4 py-2 text-sm font-black text-slate-950">
              Create poll
            </Link>
          </div>
        </div>

        {status && <p className="rounded-lg border border-slate-800 bg-panel p-5 text-slate-300">{status}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {polls.map((poll) => (
            <PollCard key={poll.publicKey} poll={poll} />
          ))}
        </div>
      </div>
    </main>
  );
}
