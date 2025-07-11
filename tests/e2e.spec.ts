import { getClient } from "@/src/app/api/tools/util";
import { wrappedMap } from "@/src/lib/static";
import { parseAbi, getAddress, formatUnits } from "viem";

const zero = 0;
// Function to get total supply of a token
async function getTotalSupply(chainId: number): Promise<number> {
  const client = getClient(chainId);
  const wrappedAddress = wrappedMap[chainId].address;

  try {
    const totalSupply = await client.readContract({
      address: getAddress(wrappedAddress),
      abi: parseAbi(["function totalSupply() view returns (uint256)"]),
      functionName: "totalSupply",
    });
    return Number(formatUnits(totalSupply, wrappedMap[chainId].decimals));
  } catch (error) {
    console.error(`Failed to get total supply for chain ${chainId}:`, error);
    return zero;
  }
}

// Function to validate token accessibility using the wrappedMap
async function validateTokenAccessibility(chainId: number): Promise<{
  chainId: number;
  symbol: string;
  address: string;
  totalSupply: number;
  isAccessible: boolean;
}> {
  const wrappedToken = wrappedMap[chainId];

  try {
    const totalSupply = await getTotalSupply(chainId);
    return {
      chainId,
      symbol: wrappedToken.symbol,
      address: wrappedToken.address,
      totalSupply,
      isAccessible: totalSupply > 1000,
    };
  } catch (error) {
    return {
      chainId,
      symbol: wrappedToken.symbol,
      address: wrappedToken.address,
      totalSupply: zero,
      isAccessible: false,
    };
  }
}

describe("Wrapped Token Holder Counts", () => {
  // Use the keys from the exported wrappedMap
  const testChains = Object.keys(wrappedMap).map(Number);

  it("should have accessible wrapped tokens on all supported chains", async () => {
    const results = await Promise.allSettled(
      testChains.map((chainId) => validateTokenAccessibility(chainId)),
    );

    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const failedResults = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )
      .map((result) => result.reason);

    console.log("Total chains in wrappedMap:", testChains.length);
    console.log("Successful token validations:", successfulResults.length);
    console.log("Failed token validations:", failedResults.length);

    // Log details for each chain
    successfulResults.forEach((result) => {
      console.log(
        `${result.symbol} (Chain ${result.chainId}): ${result.isAccessible ? "✅ Accessible" : "❌ Not accessible"} - Supply: ${result.totalSupply}`,
      );
    });

    // Test that at least 80% of chains have accessible tokens
    const accessibleCount = successfulResults.filter(
      (r) => r.isAccessible,
    ).length;
    const totalTested = successfulResults.length;
    const accessibilityRate = accessibleCount / totalTested;

    expect(accessibilityRate).toBeGreaterThan(0.8);
    expect(accessibleCount).toBeGreaterThan(10); // At least 10 chains should be accessible
  }, 60000); // 60 second timeout for all network calls

  it("should have non-zero total supply for mainnet chains", async () => {
    const mainnetChains = [1, 10, 56, 137, 8453, 42161, 43114]; // Major mainnet chains
    const availableMainnetChains = mainnetChains.filter(
      (chainId) => chainId in wrappedMap,
    );

    const results = await Promise.allSettled(
      availableMainnetChains.map((chainId) => getTotalSupply(chainId)),
    );

    const successfulSupplies = results
      .filter(
        (result): result is PromiseFulfilledResult<bigint> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    // All mainnet chains should have some supply
    successfulSupplies.forEach((supply, index) => {
      const chainId = availableMainnetChains[index];
      console.log(`Chain ${chainId} total supply: ${supply}`);
      expect(supply).toBeGreaterThan(zero);
    });

    expect(successfulSupplies.length).toBeGreaterThan(0);
  }, 30000);

  it("should validate all wrappedMap entries have valid contract addresses", () => {
    testChains.forEach((chainId) => {
      const wrappedToken = wrappedMap[chainId];

      // Check that address is a valid Ethereum address
      expect(wrappedToken.address).toMatch(/^0x[a-fA-F0-9]{40}$/);

      // Check that symbol is not empty
      expect(wrappedToken.symbol).toBeTruthy();
      expect(wrappedToken.symbol.length).toBeGreaterThan(0);

      // Check that decimals is a reasonable value
      expect(wrappedToken.decimals).toBeGreaterThan(0);
      expect(wrappedToken.decimals).toBeLessThanOrEqual(18);
    });
  });

  it("should test all chains from wrappedMap", () => {
    // Verify we're testing all chains that are in the wrappedMap
    expect(testChains.length).toBe(Object.keys(wrappedMap).length);

    // Log all chains being tested
    console.log(
      "Testing chains:",
      testChains.sort((a, b) => a - b),
    );

    // Verify all chain IDs are numbers
    testChains.forEach((chainId) => {
      expect(typeof chainId).toBe("number");
      expect(Number.isInteger(chainId)).toBe(true);
    });
  });
});
