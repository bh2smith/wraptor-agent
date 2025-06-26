import { NextResponse } from "next/server";
import { DESCRIPTION, IMAGE, INSTRUCTIONS, NAME } from "./constants";
import {
  addressParam,
  AddressSchema,
  amountParam,
  chainIdParam,
  MetaTransactionSchema,
  SignRequestResponse200,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

const bitteConfig = JSON.parse(process.env.BITTE_CONFIG || "{}");

const url = bitteConfig.url || "https://wraptor-agent.vercel.app";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: NAME,
      description: DESCRIPTION,
      version: "1.0.0",
    },
    servers: [{ url }],
    "x-mb": {
      "account-id": "max-normal.near",
      assistant: {
        name: NAME,
        description: DESCRIPTION,
        instructions: INSTRUCTIONS,
        tools: [{ type: "generate-evm-tx" }],
        image: `${url}/${IMAGE}`,
        categories: ["wrappin'"],
        chainIds: [
          1, // Mainnet
          10, // Optimism
          56, // Binance Smart Chain (BSC)
          137, // Polygon
          8453, // Base (Coinbase L2)
          42161, // Arbitrum One
          42220, // CELO
          43114, // Avalanche
          81457, // Blast
        ],
      },
    },
    paths: {
      "/api/tools/weth/wrap": {
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
            "200": { $ref: "#/components/responses/SignRequest200" },
            "400": { $ref: "#/components/responses/BadRequest400" },
          },
        },
      },
      "/api/tools/weth/unwrap": {
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
            "200": { $ref: "#/components/responses/SignRequest200" },
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

  return NextResponse.json(pluginData);
}
