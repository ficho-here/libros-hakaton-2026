import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

describe("goty_voting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GotyVoting as any;
  const creator = provider.wallet;
  const voter = anchor.web3.Keypair.generate();

  const pollId = new anchor.BN(Date.now());
  const title = "Game of the Year 2026";
  const options = ["Clair Obscur", "Hades II", "GTA VI", "Hollow Knight: Silksong"];

  let pollPda: anchor.web3.PublicKey;
  let votePda: anchor.web3.PublicKey;

  before(async () => {
    const sig = await provider.connection.requestAirdrop(voter.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");

    [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), creator.publicKey.toBuffer(), pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), pollPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId
    );
  });

  it("creates a poll", async () => {
    await program.methods
      .createPoll(pollId, title, options)
      .accounts({
        poll: pollPda,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const poll = await program.account.poll.fetch(pollPda);
    expect(poll.pollId.toString()).to.equal(pollId.toString());
    expect(poll.creator.toBase58()).to.equal(creator.publicKey.toBase58());
    expect(poll.title).to.equal(title);
    expect(poll.options).to.deep.equal(options);
    expect(poll.voteCounts.map((count: anchor.BN) => count.toNumber())).to.deep.equal([0, 0, 0, 0]);
    expect(poll.totalVotes.toNumber()).to.equal(0);
  });

  it("allows a wallet to vote", async () => {
    await program.methods
      .vote(1)
      .accounts({
        poll: pollPda,
        vote: votePda,
        voter: voter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const poll = await program.account.poll.fetch(pollPda);
    const vote = await program.account.voteRecord.fetch(votePda);

    expect(vote.voter.toBase58()).to.equal(voter.publicKey.toBase58());
    expect(vote.poll.toBase58()).to.equal(pollPda.toBase58());
    expect(vote.optionIndex).to.equal(1);
    expect(poll.voteCounts.map((count: anchor.BN) => count.toNumber())).to.deep.equal([0, 1, 0, 0]);
    expect(poll.totalVotes.toNumber()).to.equal(1);
  });

  it("blocks duplicate voting", async () => {
    try {
      await program.methods
        .vote(2)
        .accounts({
          poll: pollPda,
          vote: votePda,
          voter: voter.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc();

      expect.fail("Duplicate vote should have failed");
    } catch (error) {
      expect(String(error)).to.include("already in use");
    }
  });

  it("keeps vote counts unchanged after blocked duplicate", async () => {
    const poll = await program.account.poll.fetch(pollPda);
    expect(poll.voteCounts.map((count: anchor.BN) => count.toNumber())).to.deep.equal([0, 1, 0, 0]);
    expect(poll.totalVotes.toNumber()).to.equal(1);
  });
});
