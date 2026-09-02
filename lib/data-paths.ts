import path from "path";

/** Amvera mounts persistent storage at /data. Locally we use the project root. */
export function getDataRoot(): string {
  return process.env.DATA_DIR || (process.env.NODE_ENV === "production" ? "/data" : process.cwd());
}

export function getUploadsRoot(...parts: string[]): string {
  return path.join(getDataRoot(), "uploads", ...parts);
}
