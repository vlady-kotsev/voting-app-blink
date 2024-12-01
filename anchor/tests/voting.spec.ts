import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import exp from "constants";
const IDL = require("../target/idl/voting.json");
const PROGRAM_ID = new PublicKey("MpF1jqM46dUA1xaMVaxaghCDguKipKxo3prbMmDy7ir");

describe("voting", () => {
  // anchor.setProvider(anchor.AnchorProvider.env());
  // let votingProgram: anchor.Program<Voting> = anchor.workspace
  //   .Voting as Program<Voting>;
  let votingProgram: Program<Voting>;
  beforeAll(async () => {
    const context = await startAnchor(
      "",
      [
        {
          name: "voting",
          programId: PROGRAM_ID,
        },
      ],
      []
    );
    const provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
  });

  it("Initialize Voting", async () => {
    await votingProgram.methods
      .initPoll(new anchor.BN(1), "Favorite team?")
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      PROGRAM_ID
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(Number(poll.pollId)).toBe(1);
    expect(poll.pollQuestion).toBe("Favorite team?");
    expect(Number(poll.candidateCount)).toBe(0);
  });

  it("Initialize Candidate", async () => {
    await votingProgram.methods
      .initCandidate(new anchor.BN(1), new anchor.BN(1), "Levski")
      .rpc();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await votingProgram.methods
      .initCandidate(new anchor.BN(1), new anchor.BN(2), "CSKA")
      .rpc();

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );

    const candidate = await votingProgram.account.candidate.fetch(
      candidateAddress
    );

    expect(Number(candidate.candidateId)).toBe(1);
    expect(candidate.candidateName).toBe("Levski");
    expect(Number(candidate.votes)).toBe(0);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      PROGRAM_ID
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    expect(poll.candidateCount.toNumber()).toBe(1);
  });

  it("Test voting", async () => {
    // await votingProgram.methods.vote(new anchor.BN(1), new anchor.BN(1)).rpc();
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await votingProgram.methods.vote(new anchor.BN(1), new anchor.BN(1)).rpc();

    const [candidatePDA] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
        new anchor.BN(2).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );

    const candidate = await votingProgram.account.candidate.fetch(candidatePDA);

    expect(candidate.votes.toNumber()).toBe(2);
  });
});
