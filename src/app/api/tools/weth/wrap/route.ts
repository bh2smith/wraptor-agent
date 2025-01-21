import { signRequestFor, wrapMetaTransaction } from "@bitte-ai/agent-sdk";
import { validateWethInput } from "../../util";
import { NextRequest, NextResponse } from "next/server";
import { formatUnits } from "viem";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const search = req.nextUrl.searchParams;
  console.log("wrap/", search);
  try {
    const {
      chainId,
      amount,
      nativeAsset: { symbol, scanUrl, decimals },
      balances: { native },
    } = await validateWethInput(search);
    // TODO if all - determine if account is contract and deduct gas...
    return NextResponse.json(
      {
        transaction: signRequestFor({
          chainId,
          metaTransactions: [
            wrapMetaTransaction(chainId, amount > native ? native : amount),
          ],
        }),
        meta: {
          description: `Wraps ${formatUnits(amount, decimals)} ${symbol} to ${scanUrl}.`,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : `Unknown error occurred ${String(error)}`;
    console.error("wrap/ error", message);
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
