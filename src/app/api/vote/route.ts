import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  LinkedAction,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
const IDL = require("@/../../anchor/target/idl/voting.json");
import { Voting } from "@/../../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://i.ytimg.com/vi/9B-y36Qkm_Y/maxresdefault.jpg",
    title: "Team Vote",
    type: "action",
    description: "Vote for your favorite team",
    label: "Vote",
    links: {
      actions: [
        {
          type: "post",
          label: "Levski",
          href: "/api/vote?candidate=Levski",
        },
        {
          type: "post",
          label: "CSKA",
          href: "/api/vote?candidate=CSKA",
        },
      ],
    },
  };
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const votingProgram = new Program<Voting>(IDL, { connection });

  const url = new URL(request.url);

  const candidate = url.searchParams.get("candidate");
  if (candidate !== "Levski" && candidate !== "CSKA") {
    return new Response("Invalid candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const body: ActionPostRequest = await request.json();

  let voter;
  try {
    voter = new PublicKey(body.account);
  } catch {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  let option: number = 1;
  switch (candidate) {
    case "Levski":
      option = 1;
      break;
    case "CSKA":
      option = 2;
      break;
  }

  const instruction = await votingProgram.methods
    .vote(new BN(1), new BN(option))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  });
}
