# Libros Frontend

Next.js app for the Solana Devnet Game of the Year voting dApp.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Required After Anchor Build

After the Anchor program builds, copy:

```bash
cp ../target/idl/goty_voting.json ./src/idl/goty_voting.json
```

Then update the deployed program ID in:

```text
src/utils/constants.ts
```

Phantom must be installed and set to Devnet.
