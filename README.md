# Bitte Open WETH9 Agent

A Next.js project that provides an AI assistant for wrapping and unwrapping WETH9 through a plugin interface.

## Getting Started

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the API.

## Features

This agent provides an OpenAPI interface for managing Safe accounts with the following endpoints:

### Wrap
`GET /api/tools/weth/wrap`

### Unwrap
`GET /api/tools/weth/unwrap`

### Response Format

All successful transactions return a standard format:
```typescript
{
  transaction: {
    method: "eth_sendTransaction",
    chainId: number,
    params: [{
      to: string,
      data: string,
      value: string
    }]
  },
  meta: {
    description: string // Description of the transaction
  }
}
```

## AI Assistant Integration

The agent includes an AI assistant configured to:
- Help users deploy new Safe accounts
- Guide users through adding recovery addresses
- Generate EVM transactions for Safe operations
- Provide Safe interface URLs for transaction verification

The assistant will proactively ask users if they want to add a recovery address during deployment flows.

## Learn More

- [Bitte Documentation](https://docs.bitte.ai)
- [Bitte App Interface](https://wallet.bitte.ai)
