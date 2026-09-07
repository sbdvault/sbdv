import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Layero has neither libssl.so.1.1 nor libssl.so.3. Pin the OpenSSL 3 query
 * engine and load the bundled libraries in prisma/engines before it starts.
 */
function pinOpenSsl3QueryEngine() {
  if (process.platform !== "linux") return;

  const libDir = path.join(process.cwd(), "prisma", "engines");
  if (
    fs.existsSync(path.join(libDir, "libssl.so.3")) &&
    fs.existsSync(path.join(libDir, "libcrypto.so.3"))
  ) {
    const current = process.env.LD_LIBRARY_PATH;
    process.env.LD_LIBRARY_PATH = current ? `${libDir}:${current}` : libDir;
  }

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
