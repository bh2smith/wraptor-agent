const urlWithAll =
  "/?amount=0.123&chainId=100&evmAddress=0x6810e776880c02933d47db1b9fc05908e5386b96&all=false";

const urlWithoutAll =
  "/?amount=0.123&chainId=100&evmAddress=0x6810e776880c02933d47db1b9fc05908e5386b96";

// util.test.ts
import { describe, it, expect } from "bun:test";
import {
  UnwrapEthSchema,
  validateQuery,
  WrapEthSchema,
} from "../src/lib/schema";

describe("Schema Validation", () => {
  it("Validates the wrap schema", async () => {
    // Test that it doesn't throw
    expect(validateQuery({ url: urlWithAll }, WrapEthSchema)).toStrictEqual({
      ok: true,
      query: {
        all: false,
        amount: 0.123,
        chainId: 100,
        evmAddress: "0x6810e776880c02933d47db1b9fc05908e5386b96",
      },
    });

    expect(validateQuery({ url: urlWithoutAll }, WrapEthSchema)).toStrictEqual({
      ok: true,
      query: {
        amount: 0.123,
        chainId: 100,
        evmAddress: "0x6810e776880c02933d47db1b9fc05908e5386b96",
      },
    });
  });
  it("Validates the unwrap schema", async () => {
    // Test that it doesn't throw
    expect(validateQuery({ url: urlWithAll }, UnwrapEthSchema)).toStrictEqual({
      ok: true,
      query: {
        all: false,
        amount: 0.123,
        chainId: 100,
        evmAddress: "0x6810e776880c02933d47db1b9fc05908e5386b96",
      },
    });

    expect(
      validateQuery({ url: urlWithoutAll }, UnwrapEthSchema),
    ).toStrictEqual({
      ok: true,
      query: {
        amount: 0.123,
        chainId: 100,
        evmAddress: "0x6810e776880c02933d47db1b9fc05908e5386b96",
      },
    });
  });
});
