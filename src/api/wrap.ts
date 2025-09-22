import { Router, Request, Response } from "express";
import {
  SignRequestResponse,
  validateWethInput,
  wrapMetaTransaction,
} from "../lib/util";
import { formatUnits } from "viem";

const wrapHandler = Router();

wrapHandler.get("/", async (req: Request, res: Response) => {
  const search = new URL(req.url).searchParams;
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
  res.status(200).json(response);
});

export default wrapHandler;
