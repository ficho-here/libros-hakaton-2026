import Link from "next/link";
import { CreatePollForm } from "@/components/CreatePollForm";
import { WalletButton } from "@/components/WalletButton";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8">
        <header className="motion-fade-up flex flex-col gap-4 border-b border-[#42515a]/40 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="border-l-4 border-neon pl-4">
            <Link href="/" className="text-sm font-bold text-neon">
              Back to polls
            </Link>
            <h1 className="mt-3 text-4xl font-black text-white">Create GOTY poll</h1>
            <p className="mt-2 text-slate-300">
              Add 2 to 10 game nominees. The poll title, options, creator, timestamp, and vote counts live on-chain.
            </p>
          </div>
          <WalletButton />
        </header>
        <CreatePollForm />
      </div>
    </main>
  );
}
