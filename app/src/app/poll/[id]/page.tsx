"use client";

import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UsernameSettings } from "@/components/UsernameSettings";
import { VotePanel } from "@/components/VotePanel";
import { WalletButton } from "@/components/WalletButton";
import { PollAccount, VoteAccount } from "@/services/votingService";
import { useVotingProgram } from "@/hooks/useVotingProgram";
import { mockPolls } from "@/utils/constants";

type LocalPollData = {
  title: string;
  options: string[];
  voteCounts: number[];
  totalVotes: number;
};

type LocalPollVoteState = {
  voteCounts: number[];
  totalVotes: number;
  voters: Record<string, number>;
};

type LocalVoteRecord = {
  pollId: string;
  optionIndex: number;
  updatedAt: string;
};

function safeParseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getLocalPollVoteStateKey(pollId: string): string {
  return `chainvote:localPoll:${pollId}:votes`;
}

function getLocalVotesKey(walletAddress: string): string {
  return `chainvote:localVotes:${walletAddress}`;
}

function readLocalPollVoteState(pollId: string, optionsCount: number): LocalPollVoteState | null {
  const storedState = safeParseJson<LocalPollVoteState>(localStorage.getItem(getLocalPollVoteStateKey(pollId)));

  if (!storedState || storedState.voteCounts.length !== optionsCount) {
    return null;
  }

  return storedState;
}

function writeLocalVoteRecord(walletAddress: string, record: LocalVoteRecord) {
  const currentRecords = safeParseJson<LocalVoteRecord[]>(localStorage.getItem(getLocalVotesKey(walletAddress))) ?? [];
  const existingIndex = currentRecords.findIndex((currentRecord) => currentRecord.pollId === record.pollId);
  const nextRecords = [...currentRecords];

  if (existingIndex >= 0) {
    nextRecords[existingIndex] = record;
  } else {
    nextRecords.push(record);
  }

  localStorage.setItem(getLocalVotesKey(walletAddress), JSON.stringify(nextRecords));
}

export default function PollDetailsPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { source?: string };
}) {
  const wallet = useWallet();
  const pollPublicKey = useMemo(() => new PublicKey(params.id), [params.id]);
  const pollPublicKeyAddress = useMemo(() => pollPublicKey.toBase58(), [pollPublicKey]);
  const { fetchPoll, fetchVotesForPoll } = useVotingProgram();
  const [poll, setPoll] = useState<PollAccount | null>(null);
  const [votes, setVotes] = useState<VoteAccount[]>([]);
  const [status, setStatus] = useState("Loading poll...");
  const [localTitle, setLocalTitle] = useState("New poll");
  const [localOptions, setLocalOptions] = useState(["Option 1", "Option 2"]);
  const [localFormStatus, setLocalFormStatus] = useState("");
  const [localPoll, setLocalPoll] = useState<LocalPollData | null>(null);
  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null);
  const [localVoteStatus, setLocalVoteStatus] = useState("");
  const walletAddress = useMemo(() => wallet.publicKey?.toBase58() ?? "", [wallet.publicKey]);
  const isLocalSource = searchParams?.source === "local";
  const localPollOptionsCount = localPoll?.options.length ?? 0;

  const refresh = useCallback(async () => {
    if (isLocalSource) {
      const mockPoll = mockPolls.find((currentPoll) => currentPoll.id === params.id);

      if (mockPoll) {
        setPoll(null);
        setVotes([]);
        setLocalTitle(mockPoll.title);
        setLocalOptions(mockPoll.options.map((option) => option.label));
        const localPollPreview = {
          title: mockPoll.title,
          options: mockPoll.options.map((option) => option.label),
          voteCounts: mockPoll.options.map((option) => option.votes),
          totalVotes: mockPoll.totalVotes
        };
        const storedVoteState = readLocalPollVoteState(params.id, localPollPreview.options.length);

        setLocalPoll(
          storedVoteState
            ? {
                ...localPollPreview,
                voteCounts: storedVoteState.voteCounts,
                totalVotes: storedVoteState.totalVotes
              }
            : localPollPreview
        );
        setStatus("");
        return;
      }
    }

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
  }, [fetchPoll, fetchVotesForPoll, isLocalSource, params.id, pollPublicKey]);

  useEffect(() => {
    refresh();
  }, [refresh, pollPublicKeyAddress]);

  useEffect(() => {
    if (!walletAddress) {
      setLocalSelectedOption(null);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!localPollOptionsCount || !walletAddress) {
      return;
    }

    const storedVoteState = readLocalPollVoteState(params.id, localPollOptionsCount);
    const previousOption = storedVoteState?.voters[walletAddress];
    setLocalSelectedOption(typeof previousOption === "number" ? previousOption : null);
  }, [params.id, walletAddress, localPollOptionsCount]);

  function updateLocalOption(index: number, value: string) {
    setLocalOptions((currentOptions) =>
      currentOptions.map((option, optionIndex) => (optionIndex === index ? value : option))
    );
    setLocalFormStatus("");
  }

  function handleUseLocalPollData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedTitle = localTitle.trim() || "New poll";
    const cleanedOptions = localOptions.map((option) => option.trim()).filter(Boolean);

    if (cleanedOptions.length < 2) {
      setLocalFormStatus("Add at least two options before continuing.");
      return;
    }

    localStorage.removeItem(getLocalPollVoteStateKey(params.id));
    setLocalPoll({
      title: cleanedTitle,
      options: cleanedOptions,
      voteCounts: new Array(cleanedOptions.length).fill(0),
      totalVotes: 0
    });
    setLocalSelectedOption(null);
    setLocalVoteStatus("");
    setLocalFormStatus("Poll data loaded.");
  }

  function handleLocalVote() {
    if (!localPoll) {
      return;
    }

    if (!walletAddress) {
      setLocalVoteStatus("Please connect Phantom wallet first.");
      return;
    }

    if (localSelectedOption === null) {
      setLocalVoteStatus("Choose an option before voting.");
      return;
    }

    const storedVoteState = readLocalPollVoteState(params.id, localPoll.options.length);
    const previousOption = storedVoteState?.voters[walletAddress];

    if (typeof previousOption === "number") {
      setLocalVoteStatus("This wallet has already voted in this poll.");
      return;
    }

    const nextVoteCounts = [...(storedVoteState?.voteCounts ?? localPoll.voteCounts)];
    nextVoteCounts[localSelectedOption] = (nextVoteCounts[localSelectedOption] ?? 0) + 1;
    const baseTotalVotes = storedVoteState?.totalVotes ?? localPoll.totalVotes;

    const nextVoteState: LocalPollVoteState = {
      voteCounts: nextVoteCounts,
      totalVotes: baseTotalVotes + 1,
      voters: {
        ...(storedVoteState?.voters ?? {}),
        [walletAddress]: localSelectedOption
      }
    };

    localStorage.setItem(getLocalPollVoteStateKey(params.id), JSON.stringify(nextVoteState));
    writeLocalVoteRecord(walletAddress, {
      pollId: params.id,
      optionIndex: localSelectedOption,
      updatedAt: new Date().toISOString()
    });

    setLocalPoll((currentPoll) =>
      currentPoll
        ? {
            ...currentPoll,
            voteCounts: nextVoteState.voteCounts,
            totalVotes: nextVoteState.totalVotes
          }
        : currentPoll
    );
    setLocalVoteStatus("Vote recorded.");
  }

  const loadFailed = status.startsWith("Could not load") && !poll;
  const showManualFallback = loadFailed && !localPoll;

  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8">
        <header className="motion-fade-up flex flex-col gap-4 border-b border-[#42515a]/40 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="border-l-4 border-neon pl-4">
            <Link href="/" className="text-sm font-bold text-neon">
              Back to polls
            </Link>
            <h1 className="mt-3 text-4xl font-black text-white">
              {poll?.title ?? localPoll?.title ?? "Libros poll"}
            </h1>
            <p className="mt-2 break-all text-sm text-slate-400">Poll account: {params.id}</p>
          </div>
          <WalletButton />
        </header>

        <UsernameSettings />

        {status && <p className="motion-status rounded-sm border border-[#42515a]/45 bg-panel p-5 text-slate-300">{status}</p>}
        {showManualFallback && (
          <section className="motion-panel rounded-sm border border-[#42515a]/45 border-t-neon bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="border-l-4 border-neon pl-3">
              <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Poll setup</p>
              <h2 className="mt-1 text-2xl font-black text-white">Enter poll data manually</h2>
              <p className="mt-2 text-sm text-slate-300">
                Add the poll title and options to continue voting.
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
                  className="mt-2 w-full rounded-sm border border-[#42515a]/45 bg-[#10171b] px-4 py-3 text-white outline-none transition focus:border-neon"
                  maxLength={80}
                />
              </div>

              <div className="motion-stagger space-y-3">
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
                        className="w-full rounded-sm border border-[#42515a]/45 bg-[#10171b] px-4 py-3 text-white outline-none transition focus:border-neon"
                        maxLength={40}
                      />
                      {localOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setLocalOptions((currentOptions) => currentOptions.filter((_, optionIndex) => optionIndex !== index))}
                          className="rounded-sm border border-[#42515a]/60 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-neon"
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
                  className="rounded-sm border border-[#42515a]/60 bg-[#10171b] px-4 py-3 text-sm font-bold text-white transition hover:border-neon"
                >
                  Add option
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-neon px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#d32a31]"
                >
                  Use poll data
                </button>
              </div>

              {localFormStatus && <p className="motion-status text-sm text-slate-300">{localFormStatus}</p>}
            </form>
          </section>
        )}

        {localPoll && (
          <section className="motion-panel rounded-sm border border-[#42515a]/45 bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="border-l-4 border-neon pl-3">
                <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Poll</p>
                <h2 className="mt-1 text-2xl font-black text-white">{localPoll.title}</h2>
              </div>
              <p className="rounded-sm border border-[#42515a]/60 bg-[#10171b] px-3 py-2 text-sm font-bold text-slate-200">
                {localPoll.totalVotes} total votes
              </p>
            </div>

            <div className="motion-stagger mt-5 grid gap-3 sm:grid-cols-2">
              {localPoll.options.map((option, index) => {
                const count = localPoll.voteCounts[index] ?? 0;
                const percent = localPoll.totalVotes === 0 ? 0 : Math.round((count / localPoll.totalVotes) * 100);

                return (
                  <label
                    key={`${option}-${index}`}
                    className={`cursor-pointer rounded-sm border bg-[#10171b] p-4 transition hover:border-neon hover:bg-neon/10 ${
                      localSelectedOption === index ? "border-neon bg-neon/10" : "border-[#42515a]/45"
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
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#42515a]/35">
                      <div className="motion-progress h-full bg-neon" style={{ width: `${percent}%` }} />
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLocalVote}
              disabled={localSelectedOption === null}
              className="mt-5 rounded-sm bg-neon px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_14px_32px_rgba(183,32,38,0.22)] transition hover:bg-[#d32a31] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Vote
            </button>
            {localVoteStatus && <p className="motion-status mt-4 text-sm text-slate-300">{localVoteStatus}</p>}
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
