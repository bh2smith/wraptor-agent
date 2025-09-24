import { Router, Request, Response } from "express";
import {
  SignRequestResponse,
  refineWethInput,
  wrapMetaTransaction,
} from "../lib/util";
import { formatUnits } from "viem";
import { validateQuery, WrapEthSchema, isInvalid } from "../lib/schema";

const wrapHandler = Router();

wrapHandler.get("/", async (req: Request, res: Response) => {
  const input = validateQuery(req, WrapEthSchema);
  if (isInvalid(input)) {
    res.status(400).json({
      error: input.error,
    });
    return;
  }
  const {
    chainId,
    amount,
    nativeAsset: { symbol, scanUrl, decimals },
    balances: { native },
  } = await refineWethInput(input.query);
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
