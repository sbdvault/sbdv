import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Layero's runtime reports debian-openssl-1.1.x but does not ship libssl.so.1.1.
 * Pin the OpenSSL 3 query-engine binary before Prisma resolves the engine path.
 */
function pinOpenSsl3QueryEngine() {
  if (process.platform !== "linux") return;
  if (process.env.PRISMA_QUERY_ENGINE_BINARY) return;

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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
