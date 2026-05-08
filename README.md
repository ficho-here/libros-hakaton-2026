# Libros

Libros je Solana Devnet voting dApp gdje korisnici glasaju za Game of the Year putem Phantom walleta, a svaki glas se transparentno sprema on-chain.

## Kratak Opis

Libros omogućuje korisniku da spoji Phantom wallet, napravi anketu s više igara, glasa za jednu opciju i vidi rezultate koji su spremljeni na Solana blockchainu. Svaki wallet može glasati samo jednom po anketi i taj glas se ne može promijeniti.

## Tehnologije

- Solana Devnet
- Anchor framework
- Rust smart contract
- Next.js i React
- TypeScript
- Phantom wallet
- `@solana/wallet-adapter`
- Tailwind CSS

## Funkcionalnosti

- Spajanje i odspajanje Phantom walleta
- Prikaz spojene wallet adrese
- Kreiranje Game of the Year ankete
- Spremanje ankete on-chain kroz Anchor program
- Glasanje jednom po walletu
- Glasovi se ne mogu mijenjati
- On-chain brojanje glasova
- Prikaz rezultata, ukupnog broja glasova i wallet adresa glasača

## Struktura Projekta

```text
programs/goty_voting/src/lib.rs
tests/goty_voting.ts
Anchor.toml
app/src/app/page.tsx
app/src/app/create/page.tsx
app/src/app/poll/[id]/page.tsx
app/src/components/
app/src/hooks/useVotingProgram.ts
app/src/services/votingService.ts
app/src/idl/goty_voting.json
app/src/utils/constants.ts
README.md
```

## Instalacija Dependencija

U root folderu projekta pokreni:

```bash
npm install
```

Ova naredba instalira dependencije za Anchor testove u root projektu.

Zatim instaliraj frontend dependencije:

```bash
cd app
npm install
```

Ova naredba instalira Next.js, React i wallet adapter dependencije za frontend.

## Anchor Build

Iz root foldera pokreni:

```bash
anchor build
```

Ova naredba kompajlira Rust smart contract i generira IDL datoteku.

Ako mijenjaš program ili deployaš novi program, sinkroniziraj Program ID:

```bash
anchor keys sync
```

Ova naredba upisuje Program ID iz keypaira u Anchor konfiguraciju.

## Anchor Testovi

Iz root foldera pokreni:

```bash
anchor test
```

Ova naredba pokreće Anchor testove koji provjeravaju kreiranje ankete, glasanje, blokiranje drugog glasa i brojanje glasova.

Ako lokalni Anchor CLI ne može pokrenuti lokalni validator, prvo možeš provjeriti Rust dio s:

```bash
cargo test
```

Ova naredba provjerava da se Rust program može kompajlirati i da osnovni testovi prolaze.

## Deploy Na Solana Devnet

Postavi Solana CLI na Devnet:

```bash
solana config set --url devnet
```

Ova naredba kaže Solana CLI-ju da koristi Devnet mrežu.

Zatraži testni SOL za deploy i transakcije:

```bash
solana airdrop 2
```

Ova naredba dodaje Devnet SOL u tvoj CLI wallet.

Buildaj i deployaj program:

```bash
anchor build
anchor deploy
```

Ove naredbe prvo kompajliraju smart contract, a zatim ga deployaju na Solana Devnet.

## Gdje Promijeniti Program ID

Program ID mora biti isti u ova tri mjesta:

- `programs/goty_voting/src/lib.rs` u `declare_id!("...")`
- `Anchor.toml` pod `goty_voting`
- `app/src/utils/constants.ts` u `PROGRAM_ID`

Trenutni Program ID u kodu nije default `11111111111111111111111111111111`, ali nakon vašeg deploya treba zalijepiti stvarni Devnet Program ID u sva tri mjesta.

## Gdje Kopirati IDL

Nakon svakog `anchor build`, kopiraj generirani IDL u frontend:

```bash
cp target/idl/goty_voting.json app/src/idl/goty_voting.json
```

Ova naredba omogućuje frontend aplikaciji da zna koje Anchor instrukcije i accounti postoje.

## Pokretanje Frontenda

U frontend folderu pokreni:

```bash
cd app
npm run dev
```

Ova naredba pokreće Next.js aplikaciju za lokalni demo.

Otvori u browseru:

```text
http://localhost:3000
```

## Phantom Wallet Na Devnetu

Za demo treba napraviti ovo:

1. Instaliraj Phantom ekstenziju u browser.
2. Otvori Phantom postavke.
3. Uključi Developer Settings ako je potrebno.
4. Promijeni mrežu na Devnet.
5. Dodaj Devnet SOL u wallet preko fauceta ili Solana CLI naredbe.
6. Spoji Phantom na Libros aplikaciju.

Bez Devnet SOL-a wallet ne može platiti transakcije za kreiranje ankete ili glasanje.

## Demo Scenarij Za Žiri

1. Otvorimo Libros na `http://localhost:3000`.
2. Spojimo Phantom wallet koji je postavljen na Devnet.
3. Otvorimo stranicu `Create Poll`.
4. Napravimo Game of the Year anketu s nekoliko igara.
5. Potvrdimo transakciju u Phantomu.
6. Otvorimo kreiranu anketu.
7. Glasamo za jednu igru i potvrdimo transakciju.
8. Pokažemo rezultate: broj glasova po opciji, ukupne glasove i wallet adresu glasača.
9. Pokušamo glasati ponovno istim walletom i pokažemo da smart contract blokira drugi glas.

## Poznati Problemi I TODO

- Prije finalnog demoa treba deployati program na Devnet i zalijepiti isti Program ID u `lib.rs`, `Anchor.toml` i `app/src/utils/constants.ts`.
- Nakon `anchor build` treba kopirati IDL u `app/src/idl/goty_voting.json`.
- Phantom mora biti na Devnet mreži.
- Wallet mora imati Devnet SOL za transakcije.
- `program.account.poll.all()` je jednostavno rješenje za hackathon demo. Za veći produkcijski projekt trebalo bi dodati indeksiranje ili paginaciju.
- Ako `anchor test` ne radi zbog lokalnog validatora ili CLI alata, provjeri `anchor build` i `cargo test`, zatim pokreni testove na računalu gdje Solana/Anchor lokalni alati rade ispravno.

## Korisne Naredbe

```bash
npm install
```

Instalira root dependencije.

```bash
cd app && npm install
```

Instalira frontend dependencije.

```bash
anchor build
```

Kompajlira Anchor program i generira IDL.

```bash
anchor test
```

Pokreće Anchor testove.

```bash
anchor deploy
```

Deploya program na mrežu koju Solana CLI trenutno koristi.

```bash
cp target/idl/goty_voting.json app/src/idl/goty_voting.json
```

Kopira IDL u frontend.

```bash
cd app && npm run dev
```

Pokreće Libros frontend.
