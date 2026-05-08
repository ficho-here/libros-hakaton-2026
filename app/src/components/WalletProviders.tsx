"use client";

import { ComponentType, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { CLUSTER_ENDPOINT } from "@/utils/constants";

const SolanaConnectionProvider = ConnectionProvider as unknown as ComponentType<{
  children: ReactNode;
  endpoint: string;
}>;

const SolanaWalletProvider = WalletProvider as unknown as ComponentType<{
  autoConnect?: boolean;
  children: ReactNode;
  wallets: PhantomWalletAdapter[];
}>;

const SolanaWalletModalProvider = WalletModalProvider as unknown as ComponentType<{
  children: ReactNode;
}>;

export function WalletProviders({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <SolanaConnectionProvider endpoint={CLUSTER_ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <SolanaWalletModalProvider>{children}</SolanaWalletModalProvider>
      </SolanaWalletProvider>
    </SolanaConnectionProvider>
  );
}
