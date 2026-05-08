"use client";

import { PollResults } from "@/services/votingService";

function shortenAddress(address: string) {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type ResultsPanelProps = {
  results: PollResults;
  isRefreshing?: boolean;
  onRefresh: () => Promise<void> | void;
};

export function ResultsPanel({ results, isRefreshing = false, onRefresh }: ResultsPanelProps) {
  const totalVotes = results.totalVotes;

  return (
    <section className="rounded-lg border border-slate-800 bg-panel p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-trophy">Live results</p>
          <h2 className="mt-1 text-2xl font-black text-white">{totalVotes} total votes</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:border-neon disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {results.optionResults.map((option) => {
          const percent = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);

          return (
            <div key={option.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-black text-white">{option.label}</p>
                  <p className="mt-1 text-slate-400">
                    {option.voteCount} {option.voteCount === 1 ? "vote" : "votes"}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-slate-900 px-2 py-1 font-black text-neon">{percent}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full bg-neon transition-all"
                  style={{ width: `${percent}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-black uppercase tracking-wide text-trophy">Voter wallets</h3>
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {results.voters.length === 0 && (
            <p className="rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">
              No votes yet. The first connected wallet can set the pace.
            </p>
          )}
          {results.voters.map((voter, index) => (
            <div
              key={voter.voteAccount ?? `${voter.walletAddress}-${index}`}
              className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-950 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-mono text-sm text-slate-200" title={voter.walletAddress}>
                {shortenAddress(voter.walletAddress)}
              </span>
              <span className="text-sm text-slate-400">{voter.optionLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
