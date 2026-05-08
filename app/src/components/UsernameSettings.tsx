"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/utils/constants";

function getUsernameStorageKey(walletAddress: string): string {
  return `chainvote:username:${walletAddress}`;
}

export function UsernameSettings() {
  const wallet = useWallet();
  const walletAddress = useMemo(() => wallet.publicKey?.toBase58() ?? "", [wallet.publicKey]);
  const [username, setUsername] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setSavedMessage("");

    if (!walletAddress) {
      setUsername("");
      return;
    }

    setUsername(localStorage.getItem(getUsernameStorageKey(walletAddress)) ?? "");
  }, [walletAddress]);

  function handleSaveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!walletAddress) {
      setSavedMessage("Please connect Phantom wallet first.");
      return;
    }

    localStorage.setItem(getUsernameStorageKey(walletAddress), username.trim());
    setSavedMessage("Username saved locally for this wallet.");
  }

  return (
    <section className="motion-panel rounded-sm border border-[#42515a]/45 bg-panel p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
      <h2 className="border-l-4 border-neon pl-3 text-lg font-black text-white">Username</h2>
      {!walletAddress ? (
        <p className="mt-3 text-sm text-slate-300">
          Please connect Phantom wallet first.
        </p>
      ) : (
        <form onSubmit={handleSaveUsername} className="mt-4 space-y-3">
          <p className="text-sm text-slate-300">
            Wallet: <span className="font-bold text-white">{shortenAddress(walletAddress)}</span>
          </p>
          <label className="block text-sm font-bold text-slate-200" htmlFor="username">
            Username
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setSavedMessage("");
              }}
              className="w-full rounded-sm border border-[#42515a]/45 bg-[#10171b] px-4 py-3 text-white outline-none transition focus:border-neon"
              maxLength={32}
              placeholder="Your display name"
            />
            <button
              type="submit"
              className="rounded-sm bg-neon px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#d32a31]"
            >
              Save
            </button>
          </div>
          {savedMessage && <p className="motion-status text-sm text-slate-300">{savedMessage}</p>}
        </form>
      )}
    </section>
  );
}
