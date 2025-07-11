import { getChainById } from "@bitte-ai/agent-sdk";
import { type Address } from "viem";

type Asset = {
  address: Address;
  symbol: string;
  decimals: number;
};

type WrappedAsset = {
  chainId: number;
  wrappedNative: Asset;
};

type WrappedMap = Record<number, Asset>;

export type WrappedNative = {
  address: Address;
  symbol: string;
  scanUrl: string;
  decimals: number;
};

const SUPER_CHAIN_WETH = "0x4200000000000000000000000000000000000006";

const wrapped: WrappedAsset[] = [
  {
    // Ethereum Mainnet
    chainId: 1,
    wrappedNative: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Optimism
    chainId: 10,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Binance Shit Chain
    chainId: 56,
    wrappedNative: {
      address: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      symbol: "WBNB",
      decimals: 18,
    },
  },
  {
    // Binance Testnet
    chainId: 97,
    wrappedNative: {
      address: "0x094616f0bdfb0b526bd735bf66eca0ad254ca81f",
      symbol: "WBNB",
      decimals: 18,
    },
  },

  {
    // Gnosis Chain
    chainId: 100,
    wrappedNative: {
      address: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
      symbol: "WxDAI",
      decimals: 18,
    },
  },
  {
    // Unichain
    chainId: 130,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Polygon
    chainId: 137,
    wrappedNative: {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      symbol: "WMATIC",
      decimals: 18,
    },
  },
  {
    // Sonic
    chainId: 146,
    wrappedNative: {
      address: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
      symbol: "wS",
      decimals: 18,
    },
  },
  {
    // Fantom
    chainId: 250,
    wrappedNative: {
      address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      symbol: "WFTM",
      decimals: 18,
    },
  },
  {
    // Soneium
    chainId: 1868,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Base
    chainId: 8453,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Mode
    chainId: 34443,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Avalanche C-Chain
    chainId: 43114,
    wrappedNative: {
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      symbol: "WAVAX",
      decimals: 18,
    },
  },
  {
    // Arbitrum One
    chainId: 42161,
    wrappedNative: {
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Celo
    chainId: 42220,
    wrappedNative: {
      address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      symbol: "CELO",
      decimals: 18,
    },
  },
  {
    // Berachain
    chainId: 80094,
    wrappedNative: {
      address: "0x6969696969696969696969696969696969696969",
      symbol: "WBERA",
      decimals: 18,
    },
  },
  {
    // Blast
    chainId: 81457,
    wrappedNative: {
      address: "0x4300000000000000000000000000000000000004",
      symbol: "WETH",
      decimals: 18,
    },
  },
  {
    // Base Sepolia
    chainId: 84532,
    wrappedNative: {
      address: SUPER_CHAIN_WETH,
      symbol: "WETH",
      decimals: 18,
    },
  },
];

export const wrappedMap: WrappedMap = wrapped.reduce((acc, item) => {
  acc[item.chainId] = item.wrappedNative;
  return acc;
}, {} as WrappedMap);

export function getWrappedNative(chainId: number): WrappedNative {
  const chain = getChainById(chainId);

  const weth = wrappedMap[chainId];
  if (!weth) {
    throw new Error(
      `Couldn't find wrapped address for Network ${chain.name} (chainId=${chainId}). Please report to https://github.com/bh2smith/wraptor-agent/issues`,
    );
  }
  return {
    ...weth,
    scanUrl: `${chain.blockExplorers?.default.url}/address/${weth.address}`,
  };
}
