"use client";

import { FormEvent, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVotingProgram } from "@/hooks/useVotingProgram";

const DEFAULT_OPTIONS = ["Clair Obscur", "Hades II", "GTA VI", "Hollow Knight: Silksong"];

export function CreatePollForm() {
  const wallet = useWallet();
  const { createPoll } = useVotingProgram();
  const [title, setTitle] = useState("Game of the Year 2026");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [status, setStatus] = useState("");
  const [createdPoll, setCreatedPoll] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setCreatedPoll("");

    if (!wallet.publicKey) {
      setStatus("Please connect Phantom wallet first.");
      return;
    }

    try {
      setStatus("Sending poll creation transaction to Devnet...");
      const result = await createPoll(title, options);
      setCreatedPoll(result.pollPda.toBase58());
      setStatus(`Poll created on-chain. Transaction: ${result.signature}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create poll.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="motion-panel rounded-sm border border-[#42515a]/45 border-t-neon bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
    >
      <label className="block text-sm font-bold text-slate-200" htmlFor="title">
        Poll title
      </label>
      <input
        id="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mt-2 w-full rounded-sm border border-[#42515a]/45 bg-[#10171b] px-4 py-3 text-white outline-none transition focus:border-neon"
        maxLength={80}
      />

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#42515a]/35 pt-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">Game options</h2>
        <button
          type="button"
          onClick={() => setOptions((current) => [...current, ""])}
          disabled={options.length >= 10}
          className="rounded-sm border border-[#42515a]/60 bg-[#10171b] px-3 py-2 text-sm font-bold text-white transition hover:border-neon disabled:opacity-50"
        >
          Add option
        </button>
      </div>

      <div className="motion-stagger mt-3 space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={option}
              onChange={(event) => {
                const next = [...options];
                next[index] = event.target.value;
                setOptions(next);
              }}
              className="w-full rounded-sm border border-[#42515a]/45 bg-[#10171b] px-4 py-3 text-white outline-none transition focus:border-neon"
              maxLength={40}
            />
            <button
              type="button"
              onClick={() => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))}
              disabled={options.length <= 2}
              className="rounded-sm border border-[#42515a]/60 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-neon disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-sm bg-neon px-4 py-3 font-black uppercase tracking-wide text-white shadow-[0_14px_32px_rgba(183,32,38,0.22)] transition hover:bg-[#d32a31]"
      >
        Create poll on Solana Devnet
      </button>

      {status && <p className="motion-status mt-4 break-all text-sm text-slate-300">{status}</p>}
      {createdPoll && (
        <a href={`/poll/${createdPoll}`} className="motion-status mt-3 inline-block text-sm font-bold text-neon">
          Open created poll
        </a>
      )}
    </form>
  );
}
