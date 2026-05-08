import Link from "next/link";
import PollCard from "@/components/PollCard";
import { mockPolls } from "@/utils/constants";

export default function HomePage() {
  const polls = mockPolls;

  return (
    <div className="bg-arena">
      <section className="border-b border-slate-800">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-trophy">
              Solana Devnet Voting
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Create polls and vote with Phantom.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              A hackathon-ready frontend for decentralized voting on Solana Devnet.
              Connect Phantom, browse polls, and leave the Anchor program wiring for
              the next integration pass.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="rounded-md bg-neon px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d32a31]"
              >
                Create poll
              </Link>
              <a
                href="#polls"
                className="rounded-md border border-slate-700 px-5 py-3 text-center text-sm font-black text-white transition hover:border-neon hover:text-neon"
              >
                View polls
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-panel p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-950 p-4">
                <p className="text-3xl font-black text-white">{polls.length}</p>
                <p className="mt-1 text-sm text-slate-400">Mock polls</p>
              </div>
              <div className="rounded-md bg-slate-950 p-4">
                <p className="text-3xl font-black text-white">
                  {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Demo votes</p>
              </div>
              <div className="col-span-2 rounded-md bg-slate-950 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-neon">
                  TODO
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Connect this view to Anchor account fetching after the IDL and
                  program address are finalized.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="polls" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-trophy">
              Home
            </p>
            <h2 className="mt-1 text-3xl font-black text-white">All polls</h2>
          </div>
          <p className="text-sm text-slate-400">
            Showing local mock data until blockchain integration is ready.
          </p>
        </div>

        {polls.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-panel p-8 text-center">
            <h3 className="text-xl font-black text-white">No polls yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Once Anchor fetching is connected, new Devnet polls will appear here.
            </p>
            <Link
              href="/create"
              className="mt-5 inline-flex rounded-md bg-neon px-5 py-3 text-sm font-black text-white transition hover:bg-[#d32a31]"
            >
              Create poll
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
