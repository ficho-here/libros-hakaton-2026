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
      setStatus("Connect Phantom before creating a poll.");
      return;
    }

    try {
      setStatus("Sending poll creation transaction...");
      const result = await createPoll(title, options);
      setCreatedPoll(result.pollPda.toBase58());
      setStatus(`Poll created. Transaction: ${result.signature}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create poll.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-800 bg-panel p-6">
      <label className="block text-sm font-bold text-slate-200" htmlFor="title">
        Poll title
      </label>
      <input
        id="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-neon"
        maxLength={80}
      />

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-200">Game options</h2>
        <button
          type="button"
          onClick={() => setOptions((current) => [...current, ""])}
          disabled={options.length >= 10}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Add option
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={option}
              onChange={(event) => {
                const next = [...options];
                next[index] = event.target.value;
                setOptions(next);
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-neon"
              maxLength={40}
            />
            <button
              type="button"
              onClick={() => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))}
              disabled={options.length <= 2}
              className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-neon px-4 py-3 font-black text-slate-950"
      >
        Create poll on Solana
      </button>

      {status && <p className="mt-4 break-all text-sm text-slate-300">{status}</p>}
      {createdPoll && (
        <a href={`/poll/${createdPoll}`} className="mt-3 inline-block text-sm font-bold text-neon">
          Open created poll
        </a>
      )}
    </form>
  );
}
