"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/utils/constants";

type AccountState = {
  walletAddress: string;
  username: string;
  localPollsCount: number;
  localVotesCount: number;
};

function safeParseJson(value: string | null): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function countStoredItems(keys: string[]): number {
  return keys.reduce((count, key) => {
    const parsed = safeParseJson(localStorage.getItem(key));

    if (Array.isArray(parsed)) {
      return count + parsed.length;
    }

    if (typeof parsed === "number") {
      return count + parsed;
    }

    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      if (typeof record.count === "number") {
        return count + record.count;
      }

      return count + 1;
    }

    return count;
  }, 0);
}

function readUsername(walletAddress: string): string {
  return (
    localStorage.getItem(`chainvote:username:${walletAddress}`) ??
    localStorage.getItem(`username:${walletAddress}`) ??
    ""
  );
}

function readAccountState(walletAddress: string): AccountState {
  // TODO: replace local account stats with indexed on-chain data
  const localPollsCount = countStoredItems([
    `chainvote:localPolls:${walletAddress}`,
    `localPolls:${walletAddress}`
  ]);

  // TODO: show real on-chain voting history when backend/indexer exists
  const localVotesCount = countStoredItems([
    `chainvote:localVotes:${walletAddress}`,
    `localVotes:${walletAddress}`
  ]);

  return {
    walletAddress,
    username: readUsername(walletAddress),
    localPollsCount,
    localVotesCount
  };
}

export default function UserAccount() {
  const wallet = useWallet();
  const walletAddress = useMemo(() => wallet.publicKey?.toBase58() ?? "", [wallet.publicKey]);
  const [account, setAccount] = useState<AccountState>({
    walletAddress: "",
    username: "",
    localPollsCount: 0,
    localVotesCount: 0
  });

  useEffect(() => {
    function refreshAccount() {
      if (!walletAddress) {
        setAccount({
          walletAddress: "",
          username: "",
          localPollsCount: 0,
          localVotesCount: 0
        });
        return;
      }

      setAccount(readAccountState(walletAddress));
    }

    const handleStorage = () => refreshAccount();

    refreshAccount();
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [walletAddress]);

  if (!account.walletAddress) {
    return (
      <section className="motion-panel rounded-sm border border-[#42515a]/45 bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="border-l-4 border-neon pl-3">
            <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Libros account</p>
            <h2 className="mt-2 text-2xl font-black text-white">Connect wallet</h2>
          </div>
          <span className="w-fit rounded-sm border border-[#42515a] px-3 py-2 text-sm font-black text-slate-300">
            Disconnected
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-300">Please connect Phantom wallet first.</p>
      </section>
    );
  }

  return (
    <section className="motion-panel rounded-sm border border-[#42515a]/45 bg-panel p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="border-l-4 border-neon pl-3">
          <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Libros account</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {account.username || "Unnamed voter"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">Wallet connected</p>
        </div>
        <span className="w-fit rounded-sm bg-neon px-3 py-2 text-sm font-black text-white">
          Connected
        </span>
      </div>

      <div className="motion-stagger mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-4">
          <p className="text-sm font-bold text-slate-400">Wallet address</p>
          <p className="mt-2 break-all text-sm font-semibold text-white">{account.walletAddress}</p>
        </div>
        <div className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-4">
          <p className="text-sm font-bold text-slate-400">Short address</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {shortenAddress(account.walletAddress)}
          </p>
        </div>
        <div className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-4">
          <p className="text-sm font-bold text-slate-400">Username</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {account.username || "No username saved yet"}
          </p>
        </div>
        <div className="rounded-sm border border-[#42515a]/35 bg-[#10171b] p-4">
          <p className="text-sm font-bold text-slate-400">Wallet status</p>
          <p className="mt-2 text-sm font-semibold text-white">Connected</p>
        </div>
      </div>

      <div className="motion-stagger mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-sm border border-[#42515a] bg-[#10171b] p-4">
          <p className="text-3xl font-black text-white">{account.localPollsCount}</p>
          <p className="mt-1 text-sm text-slate-400">
            {account.localPollsCount > 0 ? "Polls created" : "No polls yet"}
          </p>
        </div>
        <div className="rounded-sm border border-[#42515a] bg-[#10171b] p-4">
          <p className="text-3xl font-black text-white">{account.localVotesCount}</p>
          <p className="mt-1 text-sm text-slate-400">
            {account.localVotesCount > 0 ? "Votes cast" : "No votes yet"}
          </p>
        </div>
      </div>
    </section>
  );
}
