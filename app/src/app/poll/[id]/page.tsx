"use client";

import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UsernameSettings } from "@/components/UsernameSettings";
import { VotePanel } from "@/components/VotePanel";
import { WalletButton } from "@/components/WalletButton";
import { PollAccount, VoteAccount } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";

type LocalPollPreview = {
  title: string;
  options: string[];
  voteCounts: number[];
  totalVotes: number;
};

export default function PollDetailsPage({ params }: { params: { id: string } }) {
  const pollPublicKey = useMemo(() => new PublicKey(params.id), [params.id]);
  const { fetchPoll, fetchVotesForPoll } = useVotingProgram();
  const [poll, setPoll] = useState<PollAccount | null>(null);
  const [votes, setVotes] = useState<VoteAccount[]>([]);
  const [status, setStatus] = useState("Loading poll...");
  const [localTitle, setLocalTitle] = useState("Local preview poll");
  const [localOptions, setLocalOptions] = useState(["Option 1", "Option 2"]);
  const [localFormStatus, setLocalFormStatus] = useState("");
  const [localPoll, setLocalPoll] = useState<LocalPollPreview | null>(null);
  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null);
  const [localVoteStatus, setLocalVoteStatus] = useState("");

  async function refresh() {
    try {
      setStatus("Loading poll...");
      const [pollAccount, voteAccounts] = await Promise.all([
        fetchPoll(pollPublicKey),
        fetchVotesForPoll(pollPublicKey)
      ]);
      setPoll(pollAccount);
      setVotes(voteAccounts);
      setStatus("");
    } catch (error) {
      setPoll(null);
      setVotes([]);
      setStatus("Could not load this poll. Check the poll address, program ID, and copied IDL.");
    }
  }

  useEffect(() => {
    refresh();
  }, [pollPublicKey.toBase58()]);

  function updateLocalOption(index: number, value: string) {
    setLocalOptions((currentOptions) =>
      currentOptions.map((option, optionIndex) => (optionIndex === index ? value : option))
    );
    setLocalFormStatus("");
  }

  function handleUseLocalPollData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedTitle = localTitle.trim() || "Local preview poll";
    const cleanedOptions = localOptions.map((option) => option.trim()).filter(Boolean);

    if (cleanedOptions.length < 2) {
      setLocalFormStatus("Add at least two options before using local poll data.");
      return;
    }

    // TODO: replace local preview with on-chain poll data
    setLocalPoll({
      title: cleanedTitle,
      options: cleanedOptions,
      voteCounts: new Array(cleanedOptions.length).fill(0),
      totalVotes: 0
    });
    setLocalSelectedOption(null);
    setLocalVoteStatus("");
    setLocalFormStatus("Local preview loaded. This data is not saved to blockchain.");
  }

  function handleLocalVote() {
    if (!localPoll) {
      return;
    }

    if (localSelectedOption === null) {
      setLocalVoteStatus("Choose an option before voting.");
      return;
    }

    // TODO: connect vote action to Anchor program
    setLocalPoll((currentPoll) => {
      if (!currentPoll) {
        return currentPoll;
      }

      return {
        ...currentPoll,
        voteCounts: currentPoll.voteCounts.map((count, index) =>
          index === localSelectedOption ? count + 1 : count
        ),
        totalVotes: currentPoll.totalVotes + 1
      };
    });
    setLocalVoteStatus("Local preview vote recorded. Blockchain vote integration is handled separately.");
  }

  const loadFailed = status.startsWith("Could not load") && !poll;

  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-neon">
              Back to polls
            </Link>
            <h1 className="mt-3 text-4xl font-black text-white">
              {poll?.title ?? localPoll?.title ?? "GOTY poll"}
            </h1>
            <p className="mt-2 break-all text-sm text-slate-400">Poll account: {params.id}</p>
          </div>
          <WalletButton />
        </header>

        <UsernameSettings />

        {status && <p className="rounded-lg border border-slate-800 bg-panel p-5 text-slate-300">{status}</p>}
        {loadFailed && (
          <section className="rounded-lg border border-slate-800 bg-panel p-6">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-trophy">Local preview</p>
              <h2 className="mt-1 text-2xl font-black text-white">Enter poll data manually</h2>
              <p className="mt-2 text-sm text-slate-300">
                This preview keeps you unblocked while the Anchor program, IDL, or poll account is still being wired.
                It is not saved to blockchain.
              </p>
            </div>

            <form onSubmit={handleUseLocalPollData} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-200" htmlFor="local-title">
                  Poll title
                </label>
                <input
                  id="local-title"
                  value={localTitle}
                  onChange={(event) => {
                    setLocalTitle(event.target.value);
                    setLocalFormStatus("");
                  }}
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-neon"
                  maxLength={80}
                />
              </div>

              <div className="space-y-3">
                {localOptions.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-bold text-slate-200" htmlFor={`local-option-${index}`}>
                      Option {index + 1}
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id={`local-option-${index}`}
                        value={option}
                        onChange={(event) => updateLocalOption(index, event.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-neon"
                        maxLength={40}
                      />
                      {localOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setLocalOptions((currentOptions) => currentOptions.filter((_, optionIndex) => optionIndex !== index))}
                          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-neon"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setLocalOptions((currentOptions) => [...currentOptions, ""])}
                  className="rounded-md border border-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:border-neon"
                >
                  Add option
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-neon px-4 py-3 text-sm font-black text-white transition hover:bg-[#d32a31]"
                >
                  Use local poll data
                </button>
              </div>

              {localFormStatus && <p className="text-sm text-slate-300">{localFormStatus}</p>}
            </form>
          </section>
        )}

        {loadFailed && localPoll && (
          <section className="rounded-lg border border-slate-800 bg-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-trophy">Local preview</p>
                <h2 className="mt-1 text-2xl font-black text-white">{localPoll.title}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  This poll is local only and is not saved to blockchain.
                </p>
              </div>
              <p className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200">
                {localPoll.totalVotes} total votes
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {localPoll.options.map((option, index) => {
                const count = localPoll.voteCounts[index] ?? 0;
                const percent = localPoll.totalVotes === 0 ? 0 : Math.round((count / localPoll.totalVotes) * 100);

                return (
                  <label
                    key={`${option}-${index}`}
                    className={`cursor-pointer rounded-md border bg-slate-950 p-4 transition hover:border-neon ${
                      localSelectedOption === index ? "border-neon" : "border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="local-poll-option"
                        checked={localSelectedOption === index}
                        onChange={() => {
                          setLocalSelectedOption(index);
                          setLocalVoteStatus("");
                        }}
                        className="h-4 w-4 accent-[#b72026]"
                      />
                      <span className="font-bold text-white">{option}</span>
                    </div>
                    <div className="mt-3 flex justify-between gap-3 text-sm text-slate-300">
                      <span>{count} votes</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900">
                      <div className="h-full bg-neon" style={{ width: `${percent}%` }} />
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLocalVote}
              disabled={localSelectedOption === null}
              className="mt-5 rounded-md bg-neon px-5 py-3 text-sm font-black text-white transition hover:bg-[#d32a31] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Vote
            </button>
            {localVoteStatus && <p className="mt-4 text-sm text-slate-300">{localVoteStatus}</p>}
          </section>
        )}

        {poll && (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <VotePanel pollPublicKey={pollPublicKey} poll={poll} onVoted={refresh} />
            <ResultsPanel poll={poll} votes={votes} onRefresh={refresh} />
          </div>
        )}
      </div>
    </main>
  );
}
