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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  async function handleVote() {
    if (selectedOption === null) {
      setStatus("Choose an option before voting.");
      return;
    }

    if (!wallet.publicKey) {
      setStatus("Connect Phantom before voting.");
      return;
    }

    try {
      setStatus("Sending vote transaction...");
      const signature = await vote(pollPublicKey, selectedOption);
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
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-md border bg-slate-950 px-4 py-4 text-left font-bold text-white transition hover:border-neon ${
              selectedOption === index ? "border-neon" : "border-slate-700"
            }`}
          >
            <input
              type="radio"
              name="poll-option"
              checked={selectedOption === index}
              onChange={() => {
                setSelectedOption(index);
                setStatus("");
              }}
              className="h-4 w-4 accent-[#b72026]"
            />
            {option}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={handleVote}
        disabled={selectedOption === null}
        className="mt-5 rounded-md bg-neon px-5 py-3 text-sm font-black text-white transition hover:bg-[#d32a31] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Vote
      </button>
      {status && <p className="mt-4 break-all text-sm text-slate-300">{status}</p>}
    </section>
  );
}
