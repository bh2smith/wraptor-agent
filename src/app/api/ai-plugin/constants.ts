import { wrappedMap } from "@/src/lib/static";

export const NAME = "Bitte WETH Wraptor";
export const DESCRIPTION =
  "Agent API for transacting with WETH9. Prepares wrap and unwrap native asset transaction on any network";

export const IMAGE = "wraptor.png";
export const INSTRUCTIONS =
  "Encodes transactions for wrapping and unwraping native assets on a given chainId. If the user wants to wrap or unwrap 'all' assets, set 'all' parameter to true and amount to 0. Does not ask for confirmation.";

export const CHAIN_IDS = Object.keys(wrappedMap).map(Number);
