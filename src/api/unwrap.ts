import { Router, Request, Response } from "express";
import { formatUnits } from "viem";
import {
  refineWethInput,
  SignRequestResponse,
  unwrapMetaTransaction,
} from "../lib/util";
import { WethSchema, validateQuery, isInvalid } from "../lib/schema";

const unwrapHandler = Router();

unwrapHandler.get("/", async (req: Request, res: Response) => {
  const input = validateQuery(req, WethSchema);
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
    balances: { wrapped },
  } = await refineWethInput(input.query);
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
  res.status(200).json(response);
});

export default unwrapHandler;
