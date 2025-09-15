import { NextRequest, NextResponse } from "next/server";
import { formatUnits } from "viem";
import { unwrapMetaTransaction } from "@bitte-ai/agent-sdk/evm";

import { validateWethInput, SignRequestResponse } from "../../util";
import { handleRequest } from "@bitte-ai/agent-sdk";

async function logic(req: NextRequest): Promise<SignRequestResponse> {
  const search = req.nextUrl.searchParams;
  console.log("unwrap/", search);
  const {
    chainId,
    amount,
    nativeAsset: { symbol, scanUrl, decimals },
    balances: { wrapped },
  } = await validateWethInput(search);
  const total = amount > wrapped ? wrapped : amount;
  const response: SignRequestResponse = {
    transaction: {
      chainId,
      method: "eth_sendTransaction",
      params: [unwrapMetaTransaction(chainId, total)],
    },
    meta: {
      description: `Withdraws ${formatUnits(total, decimals)} ${symbol} from contract ${scanUrl}.`,
    },
  };
  console.log("Response", response);
  return response;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req, logic, (result) => NextResponse.json(result));
}
