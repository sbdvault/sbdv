import fs from "fs";
import os from "os";
import path from "path";

function isWritableDir(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Amvera mounts persistent storage at /data. Layero cannot create /data,
 * so production falls back to a writable temp directory.
 */
export function getDataRoot(): string {
  if (process.env.NODE_ENV !== "production") {
    return process.env.DATA_DIR || process.cwd();
  }

  const configured = process.env.DATA_DIR?.trim();
  if (configured && configured !== "/data" && isWritableDir(configured)) {
    return configured;
  }
  if (configured === "/data" && isWritableDir("/data")) {
    return "/data";
  }

  return path.join(os.tmpdir(), "sbdv-data");
}

export function getUploadsRoot(...parts: string[]): string {
  return path.join(getDataRoot(), "uploads", ...parts);
}
