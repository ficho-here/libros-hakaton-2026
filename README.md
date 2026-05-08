# GOTY ChainVote

GOTY ChainVote is a beginner-friendly Solana Devnet voting dApp for a hackathon project. Users connect a Phantom wallet, create Game of the Year polls, vote once per poll, and view on-chain results including vote counts and voter wallet addresses.

## Tech Stack

- Solana Devnet
- Anchor framework
- Rust smart contract
- Next.js with TypeScript
- `@solana/wallet-adapter`
- Phantom wallet adapter
- Tailwind CSS

## Repository Structure

```text
.
├── Anchor.toml
├── programs/goty_voting/src/lib.rs
├── tests/goty_voting.ts
├── app
│   ├── package.json
│   └── src
│       ├── app
│       ├── components
│       ├── hooks
│       ├── idl
│       ├── services
│       └── utils
└── README.md
```

## Smart Contract Features

- Create a poll PDA using seeds: `["poll", creator pubkey, poll_id little endian]`
- Store poll id, creator wallet, title, options, vote counts, total votes, timestamp, and bump
- Vote with a vote PDA using seeds: `["vote", poll pubkey, voter pubkey]`
- Store voter wallet, poll address, poll id, selected option, timestamp, and bump
- Prevent duplicate voting because the same vote PDA cannot be initialized twice
- Validate title, option count, option length, invalid option indexes, and math overflow

## Prerequisites

Install these before running the project:

- Rust
- Solana CLI
- Anchor CLI
- Node.js 18+
- Phantom browser wallet

Check versions:

```bash
rustc --version
solana --version
anchor --version
node --version
```

## Install Dependencies

From the repo root:

```bash
npm install
```

For the frontend:

```bash
cd app
npm install
```

You can use `yarn install` instead of `npm install` if your team prefers Yarn.

## Local Validator

In one terminal:

```bash
solana-test-validator
```

In another terminal:

```bash
solana config set --url localhost
solana airdrop 2
```

## Build the Anchor Program

```bash
anchor build
```

After building, sync the generated keypair into the code:

```bash
anchor keys sync
```

Then check these files and make sure they all contain the same program ID:

- `programs/goty_voting/src/lib.rs`
- `Anchor.toml`
- `app/src/utils/constants.ts`

## Run Anchor Tests

```bash
anchor test
```

The tests cover:

- Creating a poll
- Successful voting
- Blocking duplicate voting
- Vote count updates

## Deploy to Devnet

Set Solana to Devnet:

```bash
solana config set --url devnet
solana airdrop 2
```

Build and deploy:

```bash
anchor build
anchor keys sync
anchor deploy
```

Copy the deployed program ID into:

```text
app/src/utils/constants.ts
```

Copy the generated IDL into the frontend:

```bash
cp target/idl/goty_voting.json app/src/idl/goty_voting.json
```

## Run the Frontend

```bash
cd app
npm run dev
```

Open:

```text
http://localhost:3000
```

In Phantom:

1. Open settings.
2. Enable developer settings if needed.
3. Switch network to Devnet.
4. Connect to the app.

## Frontend Pages

- `/` shows the GOTY ChainVote home page, wallet connection, and poll list.
- `/create` lets users create a poll with 2 to 10 game options.
- `/poll/[id]` lets users vote and view results for a poll account address.

## Important Beginner Notes

The checked-in frontend IDL is only a placeholder. The app needs the real IDL after `anchor build`:

```bash
cp target/idl/goty_voting.json app/src/idl/goty_voting.json
```

The checked-in program ID is also a placeholder. Always update it after `anchor keys sync` or deployment.

Fetching every account with `program.account.poll.all()` is okay for a hackathon demo on Devnet. Larger production apps usually add indexing or pagination.

## Branch Workflow for Team Members

Use separate branches so teammates do not overwrite each other:

```bash
git checkout -b feature/wallet-ui
git checkout -b feature/create-poll
git checkout -b feature/results-page
git checkout -b test/anchor-voting
```

Recommended workflow:

```bash
git status
git add .
git commit -m "Add create poll form"
git push origin feature/create-poll
```

Then open a pull request and ask a teammate to review before merging.

## Hackathon Demo Checklist

- Phantom connects on Devnet
- Poll creation transaction succeeds
- Poll account appears on home page
- Wallet can vote once
- Second vote from the same wallet fails
- Results show vote counts
- Results show voter wallet addresses and selected options
