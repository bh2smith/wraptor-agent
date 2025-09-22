// util.test.ts
import { describe, it, expect } from "bun:test";
import { getBalances } from "../src/lib/util";

describe("getBalances", () => {
  it("Returns (w)ETH balances for a given address", async () => {
    const chainId = 8453;
    const address = "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA";
    // Test that it doesn't throw
    await expect(getBalances(address, chainId)).resolves.toEqual(
      expect.objectContaining({
        native: expect.any(BigInt),
        wrapped: expect.any(BigInt),
      }),
    );
  });
});
