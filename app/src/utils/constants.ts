import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export type PollOption = {
  id: string;
  label: string;
  votes: number;
};

export type Poll = {
  id: string;
  title: string;
  options: PollOption[];
  totalVotes: number;
  author: string;
  createdAt: string;
  status: "active" | "closed" | "draft";
};

// Update this after deployment:
// 1. Run `anchor keys sync`
// 2. Copy the program id into programs/goty_voting/src/lib.rs
// 3. Copy the same program id here
// 4. Copy target/idl/goty_voting.json into app/src/idl/goty_voting.json
export const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export const SOLANA_DEVNET_RPC_URL = clusterApiUrl("devnet");
export const CLUSTER_ENDPOINT = SOLANA_DEVNET_RPC_URL;

export function shortenAddress(address: string): string {
  if (!address) {
    return "";
  }

  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// TODO: Replace mockPolls with Anchor account data after the program IDL is wired in.
export const mockPolls: Poll[] = [
  {
    id: "11111111111111111111111111111111",
    title: "Best Solana hackathon idea",
    options: [
      { id: "defi", label: "DeFi dashboard", votes: 14 },
      { id: "voting", label: "On-chain voting", votes: 26 },
      { id: "nft", label: "NFT ticketing", votes: 9 }
    ],
    totalVotes: 49,
    author: "7wJmQbG4iYBqD8r6Sk6gXQmHjLwVv6o8aT1Yc2Pz9nK",
    createdAt: "2026-05-08T09:00:00.000Z",
    status: "active"
  },
  {
    id: "So11111111111111111111111111111111111111112",
    title: "Which feature should ship first?",
    options: [
      { id: "wallet", label: "Wallet connect", votes: 18 },
      { id: "create", label: "Create poll", votes: 11 },
      { id: "results", label: "Live results", votes: 16 }
    ],
    totalVotes: 45,
    author: "5NfHq9xWvT2mPpR8eK7uQnY4zA1bC6dE3fG8hJ2kL5m",
    createdAt: "2026-05-07T15:30:00.000Z",
    status: "active"
  },
  {
    id: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    title: "Preferred voting result view",
    options: [
      { id: "bars", label: "Progress bars", votes: 0 },
      { id: "chart", label: "Chart view", votes: 0 },
      { id: "table", label: "Table view", votes: 0 }
    ],
    totalVotes: 0,
    author: "9xQeWvG816bUx9EPf5fA2qN6fT9yBzC4mL8sR1pK3dV",
    createdAt: "2026-05-06T11:10:00.000Z",
    status: "draft"
  }
];
