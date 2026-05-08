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
    return "border-neon/50 bg-neon/10 text-red-100";
  }

  if (status === "closed") {
    return "border-[#42515a]/60 bg-[#42515a]/15 text-slate-300";
  }

  return "border-[#42515a]/60 bg-[#42515a]/15 text-slate-200";
}

function PollCard({ poll }: { poll: Poll }) {
  return (
    <article className="motion-panel glass-panel group relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-[#42515a]/45 p-5 transition hover:-translate-y-1 hover:border-neon/80 hover:shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-neon" />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black leading-snug text-white transition group-hover:text-red-100">{poll.title}</h2>
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
              <div key={option.id} className="rounded-sm border border-[#42515a]/35 bg-[#10171b]/80 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-200">{option.label}</span>
                  <span className="shrink-0 text-slate-400">
                    {option.votes} votes / {percentage}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#42515a]/35">
                  <div
                    className="motion-progress h-full rounded-full bg-neon"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#42515a]/35 pt-4">
        <p className="text-sm font-semibold text-slate-300">{poll.totalVotes} total votes</p>
        <Link
          href={`/poll/${poll.id}?source=local`}
          className="rounded-sm bg-neon px-3 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#d32a31]"
        >
          View poll
        </Link>
      </div>
    </article>
  );
}

export { PollCard };
export default PollCard;
