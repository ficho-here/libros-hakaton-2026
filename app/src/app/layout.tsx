import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { WalletProviders } from "@/components/WalletProviders";

export const metadata: Metadata = {
  title: "GOTY ChainVote",
  description: "Game of the Year voting on Solana Devnet"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
