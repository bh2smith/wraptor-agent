// util.test.ts
import { zeroAddress } from "viem";
import { signRequestFor } from "@bitteprotocol/agent-sdk";

describe("signRequestFor", () => {
  it("Null Tx", () => {
    const chainId = 1;
    const transaction = signRequestFor({
      chainId,
      metaTransactions: [
        {
          to: zeroAddress,
          value: "0x00",
          data: "0x",
        },
      ],
    });
    console.log(transaction);
    expect(transaction).toEqual({
      method: "eth_sendTransaction",
      chainId: 1,
      params: [
        {
          from: "0x0000000000000000000000000000000000000000",
          to: "0x0000000000000000000000000000000000000000",
          value: "0x00",
          data: "0x",
        },
      ],
    });
  });
});
