"use client";

import { PollAccount, VoteAccount } from "@/services/votingService";

export function ResultsPanel({
  poll,
  votes,
  onRefresh
}: {
  poll: PollAccount;
  votes: VoteAccount[];
  onRefresh: () => Promise<void>;
}) {
  const totalVotes = poll.totalVotes.toNumber();

  return (
    <section className="motion-panel rounded-sm border border-[#42515a]/45 bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Results</h2>
          <p className="text-sm text-slate-400">{totalVotes} total votes</p>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-sm border border-[#42515a]/60 bg-[#10171b] px-4 py-2 text-sm font-bold text-white transition hover:border-neon hover:bg-neon/10"
        >
          Refresh
        </button>
      </div>

      <div className="motion-stagger mt-5 space-y-4">
        {poll.options.map((option, index) => {
          const count = poll.voteCounts[index]?.toNumber() ?? 0;
          const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

          return (
            <div key={option} className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-3">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-bold text-white">{option}</span>
                <span className="text-slate-300">
                  {count} votes · {percent}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#42515a]/35">
                <div className="motion-progress h-full bg-neon" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="mt-8 text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Voter wallets</h3>
      <div className="motion-stagger mt-3 space-y-2">
        {votes.length === 0 && <p className="text-sm text-slate-400">No votes yet.</p>}
        {votes.map((vote) => (
          <div key={vote.publicKey} className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-3 text-sm">
            <p className="break-all text-slate-200">{vote.voter.toBase58()}</p>
            <p className="mt-1 text-slate-400">
              Voted for: {poll.options[vote.optionIndex] ?? `Option ${vote.optionIndex}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
