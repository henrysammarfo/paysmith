#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  DEFAULT_BASE_URL,
  Paysmith,
  PaysmithError,
  newIdempotencyKey,
  type PaymentMethod,
} from "@paysmithhq/sdk";

const TOOLS = [
  {
    name: "paysmith_create_agent",
    description: "Create a Paysmith agent wallet with optional spending policy (sandbox/testnet).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        country: { type: "string" },
        currency: { type: "string" },
        paymentMethods: {
          type: "array",
          items: {
            type: "string",
            enum: ["mobile_money", "bank_transfer", "crypto", "card"],
          },
        },
        dailyLimit: { type: "number" },
        maxSingleTx: { type: "number" },
      },
      required: ["name", "country", "currency"],
    },
  },
  {
    name: "paysmith_list_wallets",
    description: "List agent wallets for the configured API key.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "paysmith_get_balance",
    description: "Get balances and policy for one walletId.",
    inputSchema: {
      type: "object",
      properties: { walletId: { type: "string" } },
      required: ["walletId"],
    },
  },
  {
    name: "paysmith_pay",
    description: "Send a payment. Idempotency key is generated if omitted.",
    inputSchema: {
      type: "object",
      properties: {
        walletId: { type: "string" },
        to: { type: "string" },
        amount: { type: "number" },
        currency: { type: "string" },
        method: {
          type: "string",
          enum: ["mobile_money", "bank_transfer", "crypto", "card"],
        },
        bankCode: { type: "string" },
        note: { type: "string" },
        idempotencyKey: { type: "string" },
      },
      required: ["walletId", "to", "amount", "currency", "method"],
    },
  },
] as const;

function client(): Paysmith {
  const apiKey = process.env.PAYSMITH_API_KEY || process.env.PAYSMITH_TEST_KEY;
  if (!apiKey) throw new Error("Set PAYSMITH_API_KEY in MCP env");
  return new Paysmith({
    apiKey,
    baseUrl: process.env.PAYSMITH_BASE_URL || DEFAULT_BASE_URL,
  });
}

function textResult(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    isError,
  };
}

async function runTool(name: string, args: Record<string, unknown>) {
  const ps = client();
  switch (name) {
    case "paysmith_create_agent":
      return textResult(
        await ps.createAgent({
          name: String(args.name),
          country: String(args.country).toUpperCase(),
          currency: String(args.currency).toUpperCase(),
          paymentMethods: args.paymentMethods as PaymentMethod[] | undefined,
          spendingPolicy:
            args.dailyLimit != null || args.maxSingleTx != null
              ? {
                  dailyLimit:
                    args.dailyLimit != null ? Number(args.dailyLimit) : undefined,
                  maxSingleTx:
                    args.maxSingleTx != null ? Number(args.maxSingleTx) : undefined,
                }
              : undefined,
        }),
      );
    case "paysmith_list_wallets":
      return textResult(await ps.listWallets());
    case "paysmith_get_balance":
      return textResult(await ps.getBalance(String(args.walletId)));
    case "paysmith_pay":
      return textResult(
        await ps.pay(
          {
            walletId: String(args.walletId),
            to: String(args.to),
            amount: Number(args.amount),
            currency: String(args.currency).toUpperCase(),
            method: args.method as PaymentMethod,
            bankCode: args.bankCode != null ? String(args.bankCode) : undefined,
            note: args.note != null ? String(args.note) : undefined,
          },
          {
            idempotencyKey:
              args.idempotencyKey != null
                ? String(args.idempotencyKey)
                : newIdempotencyKey("mcp"),
          },
        ),
      );
    default:
      return textResult({ error: `Unknown tool: ${name}` }, true);
  }
}

const server = new Server(
  { name: "paysmith", version: "0.2.3" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({ ...t })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await runTool(
      request.params.name,
      (request.params.arguments as Record<string, unknown>) ?? {},
    );
  } catch (err) {
    if (err instanceof PaysmithError) {
      return textResult(
        { error: err.message, status: err.status, body: err.body },
        true,
      );
    }
    return textResult(
      { error: err instanceof Error ? err.message : String(err) },
      true,
    );
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
