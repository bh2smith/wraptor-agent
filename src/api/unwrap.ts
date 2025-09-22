import { Router, Request, Response } from "express";
import { formatUnits } from "viem";
import {
  SignRequestResponse,
  unwrapMetaTransaction,
  validateWethInput,
} from "../lib/util";

const unwrapHandler = Router();

async function logic(req: Request): Promise<SignRequestResponse> {
  const search = new URLSearchParams(req.url);
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

unwrapHandler.get("/", async (req: Request, res: Response) => {
  const x = await logic(req);
  res.status(200).json(x);
});

export default unwrapHandler;
