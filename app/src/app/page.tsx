import Link from "next/link";
import PollCard from "@/components/PollCard";
import { mockPolls } from "@/utils/constants";

export default function HomePage() {
  const polls = mockPolls;

  return (
    <div className="bg-arena">
      <section className="border-b border-[#42515a]/40">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
          <div className="border-l-4 border-neon pl-5">
            <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">
              Solana Devnet Voting
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
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
                className="rounded-sm bg-neon px-5 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-[0_14px_32px_rgba(183,32,38,0.25)] transition hover:bg-[#d32a31]"
              >
                Create poll
              </Link>
              <a
                href="#polls"
                className="rounded-sm border border-[#42515a]/70 bg-[#10171b] px-5 py-3 text-center text-sm font-black uppercase tracking-wide text-white transition hover:border-neon hover:text-white"
              >
                View polls
              </a>
            </div>
          </div>

          <div className="rounded-sm border border-[#42515a]/50 bg-panel p-2 shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
            <div className="border-b border-[#42515a]/40 bg-[#10171b] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Preview console</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3">
              <div className="rounded-sm bg-[#0c1114] p-4">
                <p className="text-3xl font-black text-white">{polls.length}</p>
                <p className="mt-1 text-sm text-slate-400">Mock polls</p>
              </div>
              <div className="rounded-sm bg-[#0c1114] p-4">
                <p className="text-3xl font-black text-white">
                  {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Demo votes</p>
              </div>
              <div className="col-span-2 rounded-sm border-l-4 border-neon bg-[#0c1114] p-4">
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

      <section id="polls" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="border-l-4 border-neon pl-4">
            <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">
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
          <div className="rounded-sm border border-dashed border-[#42515a]/70 bg-panel p-8 text-center">
            <h3 className="text-xl font-black text-white">No polls yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Once Anchor fetching is connected, new Devnet polls will appear here.
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
    </div>
  );
}
