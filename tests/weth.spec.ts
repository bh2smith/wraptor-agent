// util.test.ts
import { getBalances } from "@/src/app/api/tools/util";

describe("signRequestFor", () => {
  it("Null Tx", async () => {
    const chainId = 8453;
    const address = "0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA";
    const balances = await getBalances(address, chainId);
    console.log("Balances", balances);
  });
});
