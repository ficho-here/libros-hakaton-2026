"use client";

import { PollOption, VoteErrorCode } from "@/services/votingService";

type VotePanelProps = {
  options: PollOption[];
  selectedOptionId: string | null;
  isSubmitting: boolean;
  walletAddress?: string | null;
  errorMessage?: string;
  errorCode?: VoteErrorCode;
  successMessage?: string;
  onSelectOption: (optionId: string) => void;
  onSubmitVote: () => Promise<void> | void;
};

export function VotePanel({
  options,
  selectedOptionId,
  isSubmitting,
  walletAddress,
  errorMessage,
  errorCode,
  successMessage,
  onSelectOption,
  onSubmitVote
}: VotePanelProps) {
  const selectedOption = options.find((option) => option.id === selectedOptionId);
  const canSubmit = Boolean(walletAddress && selectedOptionId && !isSubmitting);

  return (
    <section className="rounded-lg border border-slate-800 bg-panel p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-black uppercase tracking-wide text-trophy">Cast your vote</p>
        <h2 className="text-2xl font-black text-white">Choose one option</h2>
        {!walletAddress && (
          <p className="rounded-md border border-trophy/30 bg-trophy/10 px-3 py-2 text-sm text-yellow-100">
            Connect your wallet to submit a vote. You can still preview the poll options.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              disabled={isSubmitting}
              className={`min-h-20 rounded-lg border px-4 py-4 text-left transition ${
                isSelected
                  ? "border-neon bg-neon/10 shadow-lg shadow-neon/10"
                  : "border-slate-700 bg-slate-950 hover:border-slate-500"
              } ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                Option {option.index + 1}
              </span>
              <span className="mt-1 block text-base font-black text-white">{option.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmitVote}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-md bg-neon px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-green-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {isSubmitting ? "Submitting vote..." : selectedOption ? `Vote for ${selectedOption.label}` : "Select an option"}
      </button>

      {successMessage && (
        <p className="mt-4 rounded-md border border-neon/30 bg-neon/10 px-3 py-2 text-sm font-bold text-green-100">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p
          className={`mt-4 rounded-md border px-3 py-2 text-sm font-bold ${
            errorCode === "DUPLICATE_VOTE"
              ? "border-trophy/30 bg-trophy/10 text-yellow-100"
              : "border-red-400/30 bg-red-500/10 text-red-100"
          }`}
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
}
