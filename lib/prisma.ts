import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Layero has neither libssl.so.1.1 nor libssl.so.3. Pin the OpenSSL 3 query
 * engine and load the bundled libraries in prisma/engines before it starts.
 * Vercel (Amazon Linux) uses the rhel engine and system OpenSSL — do not pin Debian.
 */
function pinOpenSsl3QueryEngine() {
  if (process.platform !== "linux") return;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return;
  if (process.env.PRISMA_QUERY_ENGINE_BINARY) return;

  const libDir = path.join(process.cwd(), "prisma", "engines");
  if (
    fs.existsSync(path.join(libDir, "libssl.so.3")) &&
    fs.existsSync(path.join(libDir, "libcrypto.so.3"))
  ) {
    const current = process.env.LD_LIBRARY_PATH;
    process.env.LD_LIBRARY_PATH = current ? `${libDir}:${current}` : libDir;
  }

  const engineName = "query-engine-debian-openssl-3.0.x";
  const candidates = [
    path.join(process.cwd(), "node_modules/.prisma/client", engineName),
    path.join(process.cwd(), "node_modules/@prisma/client", engineName),
  ];
  const engine = candidates.find((candidate) => fs.existsSync(candidate));
  if (!engine) return;

  try {
    fs.chmodSync(engine, 0o755);
  } catch {
    // Read-only filesystems still work if the bit is already set.
  }
  process.env.PRISMA_QUERY_ENGINE_BINARY = engine;
}

pinOpenSsl3QueryEngine();

/**
 * WealthMandate exists in schema and at runtime. Generated Prisma types on this
 * machine can lag; Omit+replace avoids intersecting with stale (or current)
 * overloads that collapse arguments to `never`. Return types must not be `any`
 * or array callbacks become implicit-any under `strict`.
 */
export type WealthLedgerEntryRecord = {
  id: string;
  mandateId: string;
  type: string;
  status: string;
  amountUsd: number;
  btcAmount: number | null;
  btcTxid: string | null;
  usdPerBtc: number | null;
  clientNote: string | null;
  adminNote: string | null;
  payoutMethod: string | null;
  payoutBankName: string | null;
  payoutIban: string | null;
  payoutSwift: string | null;
  payoutAccountName: string | null;
  payoutBtcAddress: string | null;
  paymentReference: string | null;
  confirmedById: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WealthMandateRecord = {
  id: string;
  clientProfileId: string;
  annualYieldPct: number;
  status: string;
  lastAccruedAt: Date;
  reportingCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  entries: WealthLedgerEntryRecord[];
  clientProfile: {
    id: string;
    userId: string;
    user: { id: string; email: string; name: string | null };
  };
};

type PrismaDelegate<T> = {
  count: (args?: object) => Promise<number>;
  findUnique: (args?: object) => Promise<T | null>;
  findFirst: (args?: object) => Promise<T | null>;
  findMany: (args?: object) => Promise<T[]>;
  create: (args?: object) => Promise<T>;
  update: (args?: object) => Promise<T>;
  delete: (args?: object) => Promise<T>;
};

export type AppPrisma = Omit<
  PrismaClient,
  "wealthMandate" | "wealthLedgerEntry" | "$transaction"
> & {
  wealthMandate: PrismaDelegate<WealthMandateRecord>;
  wealthLedgerEntry: PrismaDelegate<WealthLedgerEntryRecord>;
  $transaction: (...args: any[]) => Promise<any>;
};

/** Bump when Prisma schema relations/fields change so the dev singleton is not reused. */
const PRISMA_SCHEMA_STAMP = "wealth-mandate-v3";

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrisma | undefined;
  prismaStamp?: string;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function hasWealthMandate(client: PrismaClient | AppPrisma | undefined): boolean {
  return (
    typeof (client as { wealthMandate?: { findUnique?: unknown } } | undefined)
      ?.wealthMandate?.findUnique === "function"
  );
}

function getPrismaClient(): AppPrisma {
  if (
    globalForPrisma.prismaStamp === PRISMA_SCHEMA_STAMP &&
    hasWealthMandate(globalForPrisma.prisma) &&
    globalForPrisma.prisma
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient() as unknown as AppPrisma;
  if (!hasWealthMandate(client)) {
    throw new Error(
      "Prisma Client is missing WealthMandate. Stop the Next.js dev server, run `npx prisma generate`, then start it again.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaStamp = PRISMA_SCHEMA_STAMP;
  }
  return client;
}

export const prisma = getPrismaClient();
