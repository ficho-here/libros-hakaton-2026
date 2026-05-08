"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { PollAccount } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";

export function VotePanel({
  pollPublicKey,
  poll,
  onVoted
}: {
  pollPublicKey: PublicKey;
  poll: PollAccount;
  onVoted: () => Promise<void>;
}) {
  const wallet = useWallet();
  const { vote } = useVotingProgram();
  const [status, setStatus] = useState("");

  async function handleVote(optionIndex: number) {
    if (!wallet.publicKey) {
      setStatus("Connect Phantom before voting.");
      return;
    }

    try {
      setStatus("Sending vote transaction...");
      const signature = await vote(pollPublicKey, optionIndex);
      setStatus(`Vote recorded forever. Transaction: ${signature}`);
      await onVoted();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vote failed.";
      setStatus(message.includes("already in use") ? "This wallet already voted in this poll." : message);
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-panel p-6">
      <h2 className="text-xl font-black text-white">Cast your vote</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {poll.options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleVote(index)}
            className="rounded-md border border-slate-700 bg-slate-950 px-4 py-4 text-left font-bold text-white transition hover:border-neon"
          >
            {option}
          </button>
        ))}
      </div>
      {status && <p className="mt-4 break-all text-sm text-slate-300">{status}</p>}
    </section>
  );
}
