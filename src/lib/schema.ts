import { Address, isAddress } from "viem";
import { z } from "zod";

const evmAddressSchema = z.custom<Address>(
  (val: unknown) => {
    return typeof val === "string" && isAddress(val, { strict: false });
  },
  {
    message: "Invalid EVM address",
  },
);

export const WrapEthSchema = z.object({
  evmAddress: evmAddressSchema,
  chainId: z.number(),
  amount: z.coerce.number().positive(),
  //   all: z.boolean(),
});

export type WrapEthInput = z.infer<typeof WrapEthSchema>;

export const UnwrapEthSchema = z.object({
  evmAddress: evmAddressSchema,
  chainId: z.number(),
  amount: z.coerce.number().positive(),
  all: z.boolean().optional(),
});

export type UnwrapEthInput = z.infer<typeof UnwrapEthSchema>;

export type ValidationResult<T> =
  | { ok: true; query: T }
  | { ok: false; error: object };

export function validateQuery<T extends z.ZodType>(
  params: URLSearchParams,
  schema: T,
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(Object.fromEntries(params.entries()));
  if (!result.success) {
    return { ok: false as const, error: z.treeifyError(result.error) };
  }
  return { ok: true as const, query: result.data };
}

export function isInvalid<T>(
  result: ValidationResult<T>,
): result is { ok: false; error: object } {
  return result.ok === false;
}
