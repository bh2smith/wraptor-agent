import {
  DESCRIPTION,
  IMAGE,
  INSTRUCTIONS,
  NAME,
  CHAIN_IDS,
} from "../constants";
import {
  addressParam,
  AddressSchema,
  amountParam,
  chainIdParam,
  MetaTransactionSchema,
  SignRequestResponse200,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

const {
  VERCEL_ENV,
  VERCEL_URL,
  VERCEL_BRANCH_URL,
  VERCEL_PROJECT_PRODUCTION_URL,
} = process.env;
const PLUGIN_URL = (() => {
  switch (VERCEL_ENV) {
    case "production":
      return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
    case "preview":
      return `https://${VERCEL_BRANCH_URL || VERCEL_URL}`;
    default:
      return `http://localhost:${process.env.PORT || 3000}`;
  }
})();

const manifest = {
  openapi: "3.0.0",
  info: {
    title: NAME,
    description: DESCRIPTION,
    version: "1.0.0",
  },
  servers: [{ url: PLUGIN_URL }],
  "x-mb": {
    "account-id": "max-normal.near",
    assistant: {
      name: NAME,
      description: DESCRIPTION,
      instructions: INSTRUCTIONS,
      tools: [{ type: "generate-evm-tx" }],
      image: `${PLUGIN_URL}/${IMAGE}`,
      categories: ["wrappin'"],
      chainIds: CHAIN_IDS,
    },
  },
  paths: {
    "/api/wrap": {
      get: {
        tags: ["wrap"],
        summary: "Encode WETH deposit",
        description: "Encodes WETH deposit Transaction as MetaTransaction",
        operationId: "wrap",
        parameters: [
          { $ref: "#/components/parameters/amount" },
          { $ref: "#/components/parameters/chainId" },
          { $ref: "#/components/parameters/evmAddress" },
          { $ref: "#/components/parameters/all" },
        ],
        responses: {
          "200": { $ref: "#/components/responses/SignRequestResponse200" },
          "400": { $ref: "#/components/responses/BadRequest400" },
        },
      },
    },
    "/api/unwrap": {
      get: {
        tags: ["unwrap"],
        summary: "Encode WETH withdraw",
        description: "Encodes WETH withdraw Transaction as MetaTransaction",
        operationId: "unwrap",
        parameters: [
          { $ref: "#/components/parameters/amount" },
          { $ref: "#/components/parameters/chainId" },
          { $ref: "#/components/parameters/evmAddress" },
          { $ref: "#/components/parameters/all" },
        ],
        responses: {
          "200": { $ref: "#/components/responses/SignRequestResponse200" },
          "400": { $ref: "#/components/responses/BadRequest400" },
        },
      },
    },
  },
  components: {
    parameters: {
      all: {
        name: "all",
        in: "query",
        description: "If true, wrap or unwrap all assets",
        required: false,
        schema: {
          type: "boolean",
        },
        example: false,
      },
      amount: amountParam,
      evmAddress: {
        ...addressParam,
        name: "evmAddress",
        description: "address of connected wallet.",
      },
      chainId: chainIdParam,
    },
    responses: {
      SignRequestResponse200,
      BadRequest400: {
        description: "Bad Request - Invalid or missing parameters",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ok: {
                  type: "boolean",
                  example: false,
                },
                message: {
                  type: "string",
                  example: "Missing required parameters: chainId or amount",
                },
              },
            },
          },
        },
      },
    },
    schemas: {
      Address: AddressSchema,
      SignRequest: SignRequestSchema,
      MetaTransaction: MetaTransactionSchema,
    },
  },
  "x-readme": {
    "explorer-enabled": true,
    "proxy-enabled": true,
  },
};
export default manifest;
