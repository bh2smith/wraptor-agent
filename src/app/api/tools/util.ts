import {
  addressField,
  FieldParser,
  floatField,
  numberField,
  validateInput,
} from "@bitteprotocol/agent-sdk";
import { Network, type MetaTransaction } from "near-safe";
import {
  type Address,
  encodeFunctionData,
  getAddress,
  parseAbi,
  parseEther,
  toHex,
} from "viem";

type NativeAsset = {
  address: Address;
  symbol: string;
  scanUrl: string;
  decimals: number;
};

interface Input {
  chainId: number;
  amount: number;
  all: boolean;
  safeAddress: Address;
}

const MAX_UINT256 = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

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
  safeAddress: addressField,
};

interface Balances {
  native: bigint;
  wrapped: bigint;
}

export async function getBalances(
  address: Address,
  chainId: number,
): Promise<Balances> {
  const network = Network.fromChainId(chainId);
  const wrappedAddress = network.nativeCurrency.wrappedAddress;
  if (!wrappedAddress) {
    throw new Error(
      `Couldn't find wrapped address for Network ${network.name} (chainId=${chainId})`,
    );
  }
  console.log("wrappedAddress", wrappedAddress);
  const [native, wrapped] = await Promise.all([
    network.client.getBalance({ address }),
    network.client.readContract({
      address: getAddress(wrappedAddress),
      abi: parseAbi([
        "function balanceOf(address owner) view returns (uint256)",
      ]),
      functionName: "balanceOf",
      args: [address],
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
  nativeAsset: NativeAsset;
  balances: Balances;
}> {
  const { chainId, amount, safeAddress, all } = validateInput<Input>(
    params,
    parsers,
  );
  const balances = await getBalances(safeAddress, chainId);
  console.log("balances", balances);
  return {
    chainId,
    // Exceeds balances.
    amount: all ? MAX_UINT256 : parseEther(amount.toString()),
    nativeAsset: getNativeAsset(chainId),
    balances,
  };
}

export const unwrapMetaTransaction = (
  chainId: number,
  amount: bigint,
): MetaTransaction => {
  return {
    to: getNativeAsset(chainId).address,
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
    to: getNativeAsset(chainId).address,
    value: toHex(amount),
    // methodId for weth.deposit
    data: "0xd0e30db0",
  };
};

export function getNativeAsset(chainId: number): NativeAsset {
  const network = Network.fromChainId(chainId);
  const wethAddress = network.nativeCurrency.wrappedAddress;
  if (!wethAddress) {
    throw new Error(
      `Couldn't find wrapped address for Network ${network.name} (chainId=${chainId})`,
    );
  }
  return {
    address: getAddress(wethAddress),
    symbol: network.nativeCurrency.symbol,
    scanUrl: `${network.scanUrl}/address/${wethAddress}`,
    decimals: network.nativeCurrency.decimals,
  };
}
