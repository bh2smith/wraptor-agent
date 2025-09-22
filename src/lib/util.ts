import {
  addressField,
  FieldParser,
  floatField,
  numberField,
  validateInput,
} from "@bitte-ai/agent-sdk";
import {
  type Address,
  encodeFunctionData,
  getAddress,
  maxUint256,
  parseAbi,
  parseEther,
  toHex,
} from "viem";
import { getWrappedNative, WrappedNative } from "./static";
import {
  getChainById,
  getClientForChain,
  MetaTransaction,
  SignRequest,
} from "@bitte-ai/agent-sdk/evm";

interface Input {
  chainId: number;
  amount: number;
  all: boolean;
  evmAddress: Address;
}

function exists(param: string | null, name: string): string {
  if (!param) {
    throw new Error(`Missing required field: '${name}'`);
  }
  return param;
}

function parseField<T>(
  param: string | null,
  name: string,
  parser: (value: string) => T,
  errorMessage: string,
): T {
  const value = exists(param, name);
  try {
    return parser(value);
  } catch {
    throw new Error(`${errorMessage} '${name}': ${value}`);
  }
}

export function booleanField(param: string | null, name: string): boolean {
  const value = parseField(
    param,
    name,
    (input) => {
      const lowerCaseInput = input.toLowerCase();
      if (lowerCaseInput === "true") return true;
      if (lowerCaseInput === "false") return false;
      throw new Error(
        `Invalid Boolean field '${name}': Not a valid boolean value`,
      );
    },
    "Invalid Boolean field",
  );
  return value;
}

const parsers: FieldParser<Input> = {
  chainId: numberField,
  // Note that this is a float (i.e. token units)
  amount: floatField,
  all: booleanField,
  evmAddress: addressField,
};

interface Balances {
  native: bigint;
  wrapped: bigint;
}

export async function getBalances(
  address: Address,
  chainId: number,
): Promise<Balances> {
  const client = getClientForChain(chainId);
  const wrappedAddress = getWrappedNative(chainId).address;
  const [native, wrapped] = await Promise.all([
    client.getBalance({ address }),
    client.readContract({
      address: getAddress(wrappedAddress),
      abi: parseAbi([
        "function balanceOf(address owner) view returns (uint256)",
      ]),
      functionName: "balanceOf",
      args: [address],
      // TODO: This is weird shit.
      authorizationList: undefined, // or []
    }),
  ]);
  return {
    native,
    wrapped,
  };
}

export async function validateWethInput(params: URLSearchParams): Promise<{
  chainId: number;
  amount: bigint;
  nativeAsset: WrappedNative;
  balances: Balances;
}> {
  const { chainId, amount, evmAddress, all } = validateInput<Input>(
    params,
    parsers,
  );
  const balances = await getBalances(evmAddress, chainId);
  console.log("balances", balances);
  return {
    chainId,
    // Exceeds balances.
    amount: all ? maxUint256 : parseEther(amount.toString()),
    nativeAsset: getWrappedNative(chainId),
    balances,
  };
}

export const unwrapMetaTransaction = (
  chainId: number,
  amount: bigint,
): MetaTransaction => {
  return {
    to: getWrappedNative(chainId).address,
    value: "0x0",
    data: encodeFunctionData({
      abi: parseAbi(["function withdraw(uint wad)"]),
      functionName: "withdraw",
      args: [amount],
    }),
  };
};

export const wrapMetaTransaction = (
  chainId: number,
  amount: bigint,
): MetaTransaction => {
  return {
    to: getWrappedNative(chainId).address,
    value: toHex(amount),
    // methodId for weth.deposit
    data: "0xd0e30db0",
  };
};

export interface SignRequestResponse {
  transaction: SignRequest;
  meta: { description: string };
}
