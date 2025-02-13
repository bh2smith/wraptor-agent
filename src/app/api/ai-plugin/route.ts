import { NextResponse } from "next/server";
import { DESCRIPTION, IMAGE, INSTRUCTIONS, NAME } from "./constants";

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
      "account-id": process.env.BITTE_AGENT_ID,
      assistant: {
        name: NAME,
        description: DESCRIPTION,
        instructions: INSTRUCTIONS,
        tools: [{ type: "generate-evm-tx" }],
        image: `${url}/${IMAGE}`,
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["health"],
          summary: "Confirms server running",
          description: "Test Endpoint to confirm system is running",
          operationId: "check-health",
          parameters: [],
          responses: {
            "200": {
              description: "Ok Message",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "Ok Message",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/weth/wrap": {
        get: {
          tags: ["wrap"],
          summary: "Encode WETH deposit",
          description: "Encodes WETH deposit Transaction as MetaTransaction",
          operationId: "wrap",
          parameters: [
            { $ref: "#/components/parameters/amount" },
            { $ref: "#/components/parameters/chainId" },
            { $ref: "#/components/parameters/safeAddress" },
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
            { $ref: "#/components/parameters/safeAddress" },
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
        amount: {
          name: "amount",
          in: "query",
          description: "amount in Units",
          required: true,
          schema: {
            type: "number",
          },
          example: 0.123,
        },
        safeAddress: {
          name: "safeAddress",
          in: "query",
          required: true,
          description: "The Safe address (i.e. the connected user address)",
          schema: {
            $ref: "#/components/schemas/Address",
          },
        },
        chainId: {
          name: "chainId",
          in: "query",
          description: "Network on which to wrap the native asset",
          required: true,
          schema: {
            type: "number",
          },
          example: 1,
        },
      },
      responses: {
        SignRequest200: {
          description:
            "Standard EVM Response containing SignRequest and additional Meta reference",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  transaction: {
                    $ref: "#/components/schemas/SignRequest",
                  },
                  meta: {
                    type: "object",
                    description:
                      "Additional metadata related to the transaction",
                    additionalProperties: true,
                  },
                },
                required: ["transaction"],
              },
            },
          },
        },
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
        Address: {
          description:
            "20 byte Ethereum address encoded as a hex with `0x` prefix.",
          type: "string",
          example: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        },
        SignRequest: {
          type: "object",
          required: ["method", "chainId", "params"],
          properties: {
            method: {
              type: "string",
              enum: [
                "eth_sign",
                "personal_sign",
                "eth_sendTransaction",
                "eth_signTypedData",
                "eth_signTypedData_v4",
              ],
              description: "The signing method to be used.",
              example: "eth_sendTransaction",
            },
            chainId: {
              type: "integer",
              description:
                "The ID of the Ethereum chain where the transaction or signing is taking place.",
              example: 1,
            },
            params: {
              oneOf: [
                {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MetaTransaction",
                  },
                  description: "An array of Ethereum transaction parameters.",
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for personal_sign request",
                  example: [
                    "0x4578616d706c65206d657373616765",
                    "0x0000000000000000000000000000000000000001",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Parameters for eth_sign request",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    "0x4578616d706c65206d657373616765",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Parameters for signing structured data (TypedDataParams)",
                  example: [
                    "0x0000000000000000000000000000000000000001",
                    '{"data": {"types": {"EIP712Domain": [{"name": "name","type": "string"}]}}}',
                  ],
                },
              ],
            },
          },
        },
        MetaTransaction: {
          description: "Sufficient data representing an EVM transaction",
          type: "object",
          properties: {
            to: {
              $ref: "#/components/schemas/Address",
              description: "Recipient address",
            },
            data: {
              type: "string",
              description: "Transaction calldata",
              example: "0xd0e30db0",
            },
            value: {
              type: "string",
              description: "Transaction value",
              example: "0x1b4fbd92b5f8000",
            },
          },
          required: ["to", "data", "value"],
        },
      },
    },
    "x-readme": {
      "explorer-enabled": true,
      "proxy-enabled": true,
    },
  };

  return NextResponse.json(pluginData);
}
