import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SolanaLogo } from "@/components/BrandLogos";
import WalletButton from "@/components/WalletButton";
import { WalletProviders } from "@/components/WalletProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOTY ChainVote",
  description: "Decentralized poll voting with Phantom wallet support"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arena text-slate-100 antialiased">
        <WalletProviders>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-[#42515a]/40 bg-[#0f1417]/80 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
                  <Link href="/" className="group flex items-center gap-3 text-xl font-black tracking-tight text-white">
                    <span className="grid h-11 w-12 place-items-center rounded-md border border-[#42515a]/45 bg-[#10171b] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition group-hover:border-[#b72026]/70 group-hover:shadow-[0_0_26px_rgba(183,32,38,0.28)]">
                      <SolanaLogo className="h-full w-full" idPrefix="solanaHeaderLogo" />
                    </span>
                    <span>GOTY ChainVote</span>
                  </Link>
                  <nav
                    aria-label="Main navigation"
                    className="glass-panel flex w-fit flex-wrap items-center gap-1 rounded-md border border-[#42515a]/40 p-1"
                  >
                    <Link
                      href="/"
                      className="rounded-sm px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-neon hover:text-white"
                    >
                      Home
                    </Link>
                    <Link
                      href="/create"
                      className="rounded-sm px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-neon hover:text-white"
                    >
                      Create Poll
                    </Link>
                    <Link
                      href="/account"
                      className="rounded-sm px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-neon hover:text-white"
                    >
                      Account
                    </Link>
                  </nav>
                </div>
                <WalletButton />
              </div>
            </header>

            <main className="motion-page flex-1">{children}</main>

            <footer className="border-t border-[#42515a]/40 bg-[#0b0f12]/80">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 text-sm text-slate-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <span>Solana voting with Phantom wallet support</span>
                  <span>Built for fast, transparent polling</span>
                </div>
                <div className="flex flex-wrap items-center gap-3" aria-label="Project partners">
                  <div className="rounded-sm border border-[#42515a]/45 bg-[#10171b]/80 px-5 py-3 font-black uppercase tracking-[0.18em] text-slate-200 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
                    ELPROS
                  </div>
                  <div className="rounded-sm border border-[#42515a]/45 bg-[#10171b]/80 px-5 py-3 font-black uppercase tracking-[0.18em] text-slate-200 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
                    FFOS
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </WalletProviders>
      </body>
    </html>
  );
}
