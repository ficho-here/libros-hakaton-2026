"use client";

import { ComponentType } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const SolanaWalletMultiButton = WalletMultiButton as unknown as ComponentType;

function WalletButton() {
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <SolanaWalletMultiButton />
    </div>
  );
}

export { WalletButton };
export default WalletButton;
