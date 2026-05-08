import Link from "next/link";
import { PollWithPublicKey } from "@/services/votingService";

export function PollCard({ poll }: { poll: PollWithPublicKey }) {
  return (
    <Link
      href={`/poll/${poll.publicKey}`}
      className="block rounded-lg border border-slate-800 bg-panel p-5 transition hover:border-neon"
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-trophy">Live GOTY poll</p>
          <h2 className="mt-1 text-2xl font-black text-white">{poll.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {poll.options.map((option) => (
            <span key={option} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-200">
              {option}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-400">
          {poll.totalVotes.toString()} total votes
        </p>
      </div>
    </Link>
  );
}
