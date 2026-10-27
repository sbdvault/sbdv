/** Display helpers for sign-in IP and location. Safe to import from client components. */

export function normalizeClientIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  let value = ip.trim();
  if (!value) return null;

  value = value.replace(/^::ffff:/i, "");
  if (value.startsWith("[") && value.includes("]")) {
    value = value.slice(1, value.indexOf("]"));
  }
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.replace(/:\d+$/, "");
  }
  if (value === "::1") value = "127.0.0.1";

  return value.length > 64 ? value.slice(0, 64) : value;
}

export function isLoopbackIp(ip: string | null | undefined): boolean {
  const normalized = normalizeClientIp(ip);
  return normalized === "127.0.0.1" || normalized === "0.0.0.0";
}
