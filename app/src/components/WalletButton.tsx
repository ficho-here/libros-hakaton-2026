"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function WalletButton() {
  const { publicKey } = useWallet();
  const phantomInstalled =
    typeof window !== "undefined" && Boolean((window as Window & { solana?: { isPhantom?: boolean } }).solana?.isPhantom);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <WalletMultiButton />
      {!phantomInstalled && (
        <p className="max-w-xs text-sm text-amber-300">
          Phantom is not installed. Install Phantom, switch to Devnet, then connect.
        </p>
      )}
      {publicKey && (
        <p className="max-w-xs break-all text-sm text-slate-300">
          Connected: {publicKey.toBase58()}
        </p>
      )}
    </div>
  );
}
