import { clusterApiUrl, PublicKey } from "@solana/web3.js";

// Update this after deployment:
// 1. Run `anchor keys sync`
// 2. Copy the program id into programs/goty_voting/src/lib.rs
// 3. Copy the same program id here
// 4. Copy target/idl/goty_voting.json into app/src/idl/goty_voting.json
export const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export const CLUSTER_ENDPOINT = clusterApiUrl("devnet");
