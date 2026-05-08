"use client";

import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VotePanel } from "@/components/VotePanel";
import { WalletButton } from "@/components/WalletButton";
import {
  DuplicateVoteError,
  PollDetails,
  PollResults,
  VoteError,
  VoteErrorCode,
  getPollDetails,
  getPollResults,
  isDuplicateVoteError,
  submitVote
} from "@/services/votingService";

type PageState = "loading" | "ready" | "empty" | "error";

function getFriendlyVoteMessage(error: unknown) {
  if (error instanceof DuplicateVoteError || isDuplicateVoteError(error)) {
    return "This wallet has already voted in this poll.";
  }

  if (error instanceof VoteError) {
    return error.message;
  }

  return "Vote could not be submitted. Please try again.";
}

function getVoteErrorCode(error: unknown): VoteErrorCode {
  if (error instanceof VoteError) {
    return error.code;
  }

  return isDuplicateVoteError(error) ? "DUPLICATE_VOTE" : "UNKNOWN";
}

export default function PollDetailsPage({ params }: { params: { id: string } }) {
  const pollId = params.id;
  const { connection } = useConnection();
  const wallet = useWallet();
  const [poll, setPoll] = useState<PollDetails | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [pageMessage, setPageMessage] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteErrorCode, setVoteErrorCode] = useState<VoteErrorCode | undefined>();
  const [voteSuccess, setVoteSuccess] = useState("");

  const refresh = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) {
          setPageState("loading");
          setPageMessage("");
        }

        setIsRefreshing(true);
        const serviceContext = { connection };
        const [pollDetails, pollResults] = await Promise.all([
          getPollDetails(pollId, serviceContext),
          getPollResults(pollId, serviceContext)
        ]);

        setPoll(pollDetails);
        setResults(pollResults);
        setPageState(pollDetails.options.length === 0 ? "empty" : "ready");
        setPageMessage("");
        setSelectedOptionId((current) => current ?? pollDetails.options[0]?.id ?? null);
      } catch (error) {
        console.error("Could not load poll screen.", error);
        setPageState("error");
        setPageMessage("Could not load this poll. Check the poll address, program ID, and copied IDL.");
      } finally {
        setIsRefreshing(false);
      }
    },
    [connection, pollId]
  );

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  async function handleSubmitVote() {
    if (!selectedOptionId) {
      setVoteError("Choose an option before voting.");
      setVoteErrorCode("INVALID_OPTION");
      return;
    }

    if (!wallet.publicKey) {
      setVoteError("Connect your wallet before voting.");
      setVoteErrorCode("WALLET_NOT_CONNECTED");
      return;
    }

    try {
      setIsSubmitting(true);
      setVoteError("");
      setVoteErrorCode(undefined);
      setVoteSuccess("");
      const serviceContext = poll?.publicKey ? { connection, wallet } : {};
      await submitVote(pollId, selectedOptionId, wallet.publicKey.toBase58(), serviceContext);
      setVoteSuccess("Vote submitted. Results refreshed.");
      await refresh();
    } catch (error) {
      console.error("Vote submission failed.", error);
      setVoteError(getFriendlyVoteMessage(error));
      setVoteErrorCode(getVoteErrorCode(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link href="/" className="text-sm font-bold text-neon hover:text-green-300">
              Back to polls
            </Link>
            <p className="mt-5 text-sm font-black uppercase tracking-wide text-trophy">Poll details</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-black text-white sm:text-5xl">
              {poll?.question ?? "Loading poll..."}
            </h1>
            <p className="mt-3 break-all text-sm text-slate-400">Poll account: {poll?.publicKey ?? pollId}</p>
            {poll?.creator && <p className="mt-1 break-all text-sm text-slate-500">Created by: {poll.creator}</p>}
          </div>
          <WalletButton />
        </header>

        {pageState === "loading" && (
          <section className="rounded-lg border border-slate-800 bg-panel p-6 text-slate-300">
            Loading poll details and results...
          </section>
        )}

        {pageState === "error" && (
          <section className="rounded-lg border border-red-400/30 bg-red-500/10 p-6 text-red-100">
            {pageMessage}
          </section>
        )}

        {pageState === "empty" && (
          <section className="rounded-lg border border-slate-800 bg-panel p-6 text-slate-300">
            This poll does not have any options yet.
          </section>
        )}

        {poll && results && pageState !== "error" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <VotePanel
              options={poll.options}
              selectedOptionId={selectedOptionId}
              isSubmitting={isSubmitting}
              walletAddress={wallet.publicKey?.toBase58()}
              errorMessage={voteError}
              errorCode={voteErrorCode}
              successMessage={voteSuccess}
              onSelectOption={(optionId) => {
                setSelectedOptionId(optionId);
                setVoteError("");
                setVoteErrorCode(undefined);
                setVoteSuccess("");
              }}
              onSubmitVote={handleSubmitVote}
            />
            <ResultsPanel results={results} isRefreshing={isRefreshing} onRefresh={() => refresh()} />
          </div>
        )}
      </div>
    </main>
  );
}
