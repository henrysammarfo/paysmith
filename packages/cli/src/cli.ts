#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  DEFAULT_BASE_URL,
  Paysmith,
  PaysmithError,
  newIdempotencyKey,
  type PaymentMethod,
} from "@paysmithhq/sdk";

function client() {
  const apiKey = process.env.PAYSMITH_API_KEY || process.env.PAYSMITH_TEST_KEY;
  if (!apiKey) {
    console.error("Set PAYSMITH_API_KEY");
    process.exit(1);
  }
  return new Paysmith({
    apiKey,
    baseUrl: process.env.PAYSMITH_BASE_URL || DEFAULT_BASE_URL,
  });
}

function print(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      name: { type: "string" },
      country: { type: "string" },
      currency: { type: "string" },
      methods: { type: "string" },
      "daily-limit": { type: "string" },
      "max-tx": { type: "string" },
      wallet: { type: "string", short: "w" },
      to: { type: "string" },
      amount: { type: "string" },
      method: { type: "string" },
      "bank-code": { type: "string" },
      note: { type: "string" },
      "idempotency-key": { type: "string" },
    },
  });

  const cmd = positionals[0];
  if (!cmd || values.help) {
    console.log(`paysmith — agent payments CLI

  paysmith create --name <n> --country GH --currency GHS [--methods mobile_money]
  paysmith balance --wallet <uuid>
  paysmith wallets
  paysmith pay --wallet <uuid> --to <dest> --amount 1 --currency GHS --method mobile_money [--bank-code MTN]

Env: PAYSMITH_API_KEY  PAYSMITH_BASE_URL`);
    process.exit(cmd ? 0 : 1);
  }

  const ps = client();
  try {
    if (cmd === "create") {
      if (!values.name || !values.country || !values.currency) {
        console.error("create requires --name --country --currency");
        process.exit(1);
      }
      const methods = values.methods
        ? (values.methods.split(",").map((s) => s.trim()) as PaymentMethod[])
        : undefined;
      const daily = values["daily-limit"] ? Number(values["daily-limit"]) : undefined;
      const maxTx = values["max-tx"] ? Number(values["max-tx"]) : undefined;
      print(
        await ps.createAgent({
          name: values.name,
          country: values.country.toUpperCase(),
          currency: values.currency.toUpperCase(),
          paymentMethods: methods,
          spendingPolicy:
            daily || maxTx ? { dailyLimit: daily, maxSingleTx: maxTx } : undefined,
        }),
      );
      return;
    }
    if (cmd === "balance") {
      if (!values.wallet) {
        console.error("balance requires --wallet");
        process.exit(1);
      }
      print(await ps.getBalance(values.wallet));
      return;
    }
    if (cmd === "wallets") {
      print(await ps.listWallets());
      return;
    }
    if (cmd === "pay") {
      if (!values.wallet || !values.to || !values.amount || !values.currency || !values.method) {
        console.error("pay requires --wallet --to --amount --currency --method");
        process.exit(1);
      }
      print(
        await ps.pay(
          {
            walletId: values.wallet,
            to: values.to,
            amount: Number(values.amount),
            currency: values.currency.toUpperCase(),
            method: values.method as PaymentMethod,
            bankCode: values["bank-code"],
            note: values.note,
          },
          {
            idempotencyKey: values["idempotency-key"] || newIdempotencyKey("cli"),
          },
        ),
      );
      return;
    }
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  } catch (err) {
    if (err instanceof PaysmithError) {
      console.error(JSON.stringify({ error: err.message, status: err.status, body: err.body }, null, 2));
      process.exit(1);
    }
    throw err;
  }
}

main();
