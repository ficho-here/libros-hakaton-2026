"use client";

import { useEffect, useState } from "react";
import { shortenAddress } from "@/utils/constants";

type PhantomPublicKey = {
  toString: () => string;
  toBase58?: () => string;
};

type PhantomProvider = {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: PhantomPublicKey | null;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  on?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PhantomPublicKey | null) => void
  ) => void;
  removeListener?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PhantomPublicKey | null) => void
  ) => void;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  const provider = window.solana;
  return provider?.isPhantom ? provider : null;
}

function publicKeyToString(publicKey?: PhantomPublicKey | null): string | null {
  if (!publicKey) {
    return null;
  }

  return publicKey.toBase58?.() ?? publicKey.toString();
}

function WalletButton() {
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isCheckingProvider, setIsCheckingProvider] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const phantomProvider = getPhantomProvider();
    setProvider(phantomProvider);
    setIsCheckingProvider(false);

    if (!phantomProvider) {
      return;
    }

    const handleConnect = (nextPublicKey?: PhantomPublicKey | null) => {
      setPublicKey(publicKeyToString(nextPublicKey ?? phantomProvider.publicKey));
      setMessage("");
    };

    const handleDisconnect = () => {
      setPublicKey(null);
      setMessage("");
    };

    const handleAccountChanged = (nextPublicKey?: PhantomPublicKey | null) => {
      setPublicKey(publicKeyToString(nextPublicKey));
    };

    phantomProvider.on?.("connect", handleConnect);
    phantomProvider.on?.("disconnect", handleDisconnect);
    phantomProvider.on?.("accountChanged", handleAccountChanged);

    phantomProvider
      .connect({ onlyIfTrusted: true })
      .then((response) => setPublicKey(publicKeyToString(response.publicKey)))
      .catch(() => {
        setPublicKey(publicKeyToString(phantomProvider.publicKey));
      });

    return () => {
      phantomProvider.removeListener?.("connect", handleConnect);
      phantomProvider.removeListener?.("disconnect", handleDisconnect);
      phantomProvider.removeListener?.("accountChanged", handleAccountChanged);
    };
  }, []);

  async function connectWallet() {
    if (!provider) {
      setMessage("Phantom wallet is not installed.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      const response = await provider.connect();
      setPublicKey(publicKeyToString(response.publicKey));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function disconnectWallet() {
    if (!provider) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      await provider.disconnect();
      setPublicKey(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wallet disconnect failed.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingProvider) {
    return (
      <div className="h-10 w-36 animate-pulse rounded-md border border-slate-800 bg-slate-900" />
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <a
          href="https://phantom.app/"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-amber-400/60 px-4 py-2 text-sm font-bold text-amber-200 transition hover:border-amber-300 hover:text-amber-100"
        >
          Install Phantom
        </a>
        <p className="max-w-xs text-sm text-slate-400">
          Phantom wallet is required for Devnet voting.
        </p>
      </div>
    );
  }

  if (publicKey) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100">
            {shortenAddress(publicKey)}
          </span>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={isLoading}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
        {message && <p className="max-w-xs text-sm text-rose-300">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={connectWallet}
        disabled={isLoading}
        className="rounded-md bg-neon px-4 py-2 text-sm font-black text-white transition hover:bg-[#d32a31] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Connecting..." : "Connect Phantom"}
      </button>
      {message && <p className="max-w-xs text-sm text-rose-300">{message}</p>}
    </div>
  );
}

export { WalletButton };
export default WalletButton;
