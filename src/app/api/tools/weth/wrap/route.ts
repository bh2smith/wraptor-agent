import { handleRequest } from "@bitte-ai/agent-sdk";
import { wrapMetaTransaction } from "@bitte-ai/agent-sdk/evm";
import { SignRequestResponse, validateWethInput } from "../../util";
import { NextRequest, NextResponse } from "next/server";
import { formatUnits } from "viem";

async function logic(req: NextRequest): Promise<SignRequestResponse> {
  const search = req.nextUrl.searchParams;
  console.log("wrap/", search);
  const {
    chainId,
    amount,
    nativeAsset: { symbol, scanUrl, decimals },
    balances: { native },
  } = await validateWethInput(search);
  const response: SignRequestResponse = {
    transaction: {
      chainId,
      method: "eth_sendTransaction",
      params: [wrapMetaTransaction(chainId, amount > native ? native : amount)],
    },
    meta: {
      description: `Wraps ${formatUnits(amount, decimals)} ${symbol} to ${scanUrl}.`,
    },
  };
  console.log("Response", response);
  // TODO(bh2smith) if all - determine if account is contract and deduct gas...
  return response;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req, logic, (result) => NextResponse.json(result));
}
