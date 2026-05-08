import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import WalletButton from "@/components/WalletButton";
import { WalletProviders } from "@/components/WalletProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOTY ChainVote",
  description: "Decentralized poll voting on Solana Devnet with Phantom wallet support"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arena text-slate-100 antialiased">
        <WalletProviders>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-slate-800/90 bg-arena/95">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
                  <Link href="/" className="text-xl font-black tracking-tight text-white">
                    GOTY ChainVote
                  </Link>
                  <nav aria-label="Main navigation" className="flex items-center gap-2">
                    <Link
                      href="/"
                      className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                    >
                      Home
                    </Link>
                    <Link
                      href="/create"
                      className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                    >
                      Create Poll
                    </Link>
                    <Link
                      href="/account"
                      className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                    >
                      Account
                    </Link>
                  </nav>
                </div>
                <WalletButton />
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-slate-800/90">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span>Solana Devnet voting demo</span>
                <span>Built for hackathon iteration</span>
              </div>
            </footer>
          </div>
        </WalletProviders>
      </body>
    </html>
  );
}
