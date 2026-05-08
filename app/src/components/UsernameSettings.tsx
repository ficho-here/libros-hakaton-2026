"use client";

import { FormEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/utils/constants";

type PhantomPublicKey = {
  toString: () => string;
  toBase58?: () => string;
};

type PhantomProviderLike = {
  publicKey?: PhantomPublicKey | null;
  on?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PhantomPublicKey | null) => void
  ) => void;
  removeListener?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PhantomPublicKey | null) => void
  ) => void;
};

function getPhantomProvider(): PhantomProviderLike | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as Window & { solana?: PhantomProviderLike }).solana;
}

function publicKeyToString(publicKey?: PhantomPublicKey | null): string {
  if (!publicKey) {
    return "";
  }

  return publicKey.toBase58?.() ?? publicKey.toString();
}

function getUsernameStorageKey(walletAddress: string): string {
  return `chainvote:username:${walletAddress}`;
}

export function UsernameSettings() {
  const wallet = useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [username, setUsername] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const provider = getPhantomProvider();
    const adapterAddress = wallet.publicKey?.toBase58() ?? "";
    const providerAddress = publicKeyToString(provider?.publicKey);
    setWalletAddress(adapterAddress || providerAddress);

    const handleWalletChange = (publicKey?: PhantomPublicKey | null) => {
      setWalletAddress(publicKeyToString(publicKey));
      setSavedMessage("");
    };

    const handleDisconnect = () => {
      setWalletAddress("");
      setSavedMessage("");
    };

    provider?.on?.("connect", handleWalletChange);
    provider?.on?.("accountChanged", handleWalletChange);
    provider?.on?.("disconnect", handleDisconnect);

    return () => {
      provider?.removeListener?.("connect", handleWalletChange);
      provider?.removeListener?.("accountChanged", handleWalletChange);
      provider?.removeListener?.("disconnect", handleDisconnect);
    };
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!walletAddress) {
      setUsername("");
      return;
    }

    setUsername(localStorage.getItem(getUsernameStorageKey(walletAddress)) ?? "");
  }, [walletAddress]);

  function handleSaveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!walletAddress) {
      setSavedMessage("Connect Phantom wallet before changing your username.");
      return;
    }

    localStorage.setItem(getUsernameStorageKey(walletAddress), username.trim());
    setSavedMessage("Username saved locally for this wallet.");
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-panel p-5">
      <h2 className="text-lg font-black text-white">Username</h2>
      {!walletAddress ? (
        <p className="mt-3 text-sm text-slate-300">
          Connect Phantom wallet before changing your username.
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
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-neon"
              maxLength={32}
              placeholder="Your display name"
            />
            <button
              type="submit"
              className="rounded-md bg-neon px-4 py-3 text-sm font-black text-white transition hover:bg-[#d32a31]"
            >
              Save
            </button>
          </div>
          {savedMessage && <p className="text-sm text-slate-300">{savedMessage}</p>}
        </form>
      )}
    </section>
  );
}

