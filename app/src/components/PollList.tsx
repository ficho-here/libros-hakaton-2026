"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PollCard from "@/components/PollCard";
import { PollWithPublicKey } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";
import { Poll, mockPolls } from "@/utils/constants";

function mapChainPoll(poll: PollWithPublicKey): Poll {
  return {
    id: poll.publicKey,
    title: poll.title,
    options: poll.options.map((label, index) => ({
      id: `${poll.publicKey}-${index}`,
      label,
      votes: poll.votes[index]?.toNumber() ?? 0
    })),
    totalVotes: poll.totalVotes.toNumber(),
    author: poll.creator.toBase58(),
    createdAt: new Date(poll.createdAt.toNumber() * 1000).toISOString(),
    status: "active",
    source: "chain"
  };
}

export default function PollList() {
  const { fetchAllPolls } = useVotingProgram();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [status, setStatus] = useState("Loading Devnet polls...");
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPolls() {
      try {
        const chainPolls = await fetchAllPolls();

        if (!isMounted) {
          return;
        }

        setPolls(chainPolls.map(mapChainPoll));
        setStatus("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Could not load polls from Devnet.";
        setPolls([]);
        setStatus(`Could not load Devnet polls. ${message}`);
      }
    }

    loadPolls();

    return () => {
      isMounted = false;
    };
  }, [fetchAllPolls]);

  const displayedPolls = useMemo(() => (showExamples ? mockPolls : polls), [polls, showExamples]);

  return (
    <section id="polls" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="motion-fade-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="border-l-4 border-neon pl-4">
          <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Devnet polls</p>
          <h2 className="mt-1 text-3xl font-black text-white">Game of the Year polls</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowExamples((current) => !current)}
          className="w-fit rounded-sm border border-[#42515a]/60 bg-[#10171b] px-4 py-2 text-sm font-bold text-white transition hover:border-neon"
        >
          {showExamples ? "Show Devnet polls" : "Show example polls"}
        </button>
      </div>

      {status && !showExamples && (
        <p className="motion-status mb-5 rounded-sm border border-[#42515a]/45 bg-panel p-4 text-sm text-slate-300">
          {status}
        </p>
      )}

      {displayedPolls.length > 0 ? (
        <div className="motion-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displayedPolls.map((poll) => (
            <PollCard key={`${poll.source ?? "chain"}-${poll.id}`} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="motion-panel rounded-sm border border-dashed border-[#42515a]/70 bg-panel p-8 text-center">
          <h3 className="text-xl font-black text-white">No polls yet. Create the first Game of the Year poll.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            After a poll is created on Devnet, it will appear here with live vote totals.
          </p>
          <Link
            href="/create"
            className="mt-5 inline-flex rounded-sm bg-neon px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#d32a31]"
          >
            Create poll
          </Link>
        </div>
      )}
    </section>
  );
}
