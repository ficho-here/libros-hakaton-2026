import Link from "next/link";
import PollList from "@/components/PollList";
import VotingOrbit from "@/components/VotingOrbit";
import { mockPolls } from "@/utils/constants";

export default function HomePage() {
  const polls = mockPolls;
  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);

  return (
    <div className="bg-arena">
      <section className="border-b border-[#42515a]/40">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div className="motion-fade-up border-l-4 border-neon pl-5">
            <p className="inline-flex rounded-full border border-[#42515a]/50 bg-[#10171b]/80 px-3 py-1 text-sm font-black uppercase tracking-wide text-[#c2cbd0]">
              Libros on Solana Devnet
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Libros lets players vote for Game of the Year with Phantom.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Create decentralized polls, vote once per wallet, and show transparent on-chain results for judges and players.
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

          <VotingOrbit pollCount={polls.length} totalVotes={totalVotes} />
        </div>
      </section>

      <PollList />
    </div>
  );
}
