import { NextRequest, NextResponse } from "next/server";
import { zeroAddress } from "viem";
import {
  signRequestFor,
} from "@bitteprotocol/agent-sdk";


export async function GET(req: NextRequest): Promise<NextResponse> {
  const search = req.nextUrl.searchParams;
  console.log("null/", search);
  return NextResponse.json(
    {
      transaction: signRequestFor({
        chainId: Number(search.get("chainId") || 11155111),
        metaTransactions: [{ to: zeroAddress, value: "0x", data: "0x" }],
      }),
    },
    { status: 200 },
  );
}
