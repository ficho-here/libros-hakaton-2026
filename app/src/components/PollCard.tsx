import Link from "next/link";
import { Poll, shortenAddress } from "@/utils/constants";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getStatusClasses(status: Poll["status"]): string {
  if (status === "active") {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "closed") {
    return "border-slate-500/40 bg-slate-500/10 text-slate-300";
  }

  return "border-amber-400/40 bg-amber-400/10 text-amber-200";
}

function PollCard({ poll }: { poll: Poll }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-lg border border-slate-800 bg-panel p-5 shadow-lg shadow-black/10 transition hover:border-neon/70">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">{poll.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              By {shortenAddress(poll.author)} on {formatDate(poll.createdAt)}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClasses(
              poll.status
            )}`}
          >
            {poll.status}
          </span>
        </div>

        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

            return (
              <div key={option.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-200">{option.label}</span>
                  <span className="shrink-0 text-slate-400">
                    {option.votes} votes / {percentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-neon transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800 pt-4">
        <p className="text-sm font-semibold text-slate-300">{poll.totalVotes} total votes</p>
        {/* TODO: Replace mock ids with poll account public keys from the Anchor program. */}
        <Link
          href={`/poll/${poll.id}`}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-white transition hover:border-neon hover:text-neon"
        >
          View poll
        </Link>
      </div>
    </article>
  );
}

export { PollCard };
export default PollCard;
