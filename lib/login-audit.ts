import { prisma } from "@/lib/prisma";
import { isLoopbackIp, normalizeClientIp } from "@/lib/sign-in-display";

const UNKNOWN_LOCATION = "Unknown";

export type SignInSnapshot = {
  at: string;
  ip: string | null;
  location: string | null;
};

export function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  return normalizeClientIp(first || real || null);
}

function isPrivateIp(ip: string): boolean {
  if (isLoopbackIp(ip)) return true;
  const normalized = normalizeClientIp(ip)?.toLowerCase() || "";
  if (
    normalized === "::1" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized === "localhost"
  ) {
    return true;
  }
  if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return true;
  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  ) {
    return true;
  }
  return false;
}

function locationFromHeaders(request: Request): string | null {
  const rawCity =
    request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity") || "";
  let city = rawCity.trim();
  try {
    city = decodeURIComponent(city);
  } catch {
    /* keep raw */
  }
  const country = (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    ""
  ).trim();
  const parts = [city, country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

async function lookupPublicLocation(ip: string): Promise<string> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(2500),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return UNKNOWN_LOCATION;
    const json = (await res.json()) as {
      success?: boolean;
      city?: unknown;
      country?: unknown;
    };
    if (!json.success) return UNKNOWN_LOCATION;
    const city = typeof json.city === "string" ? json.city.trim() : "";
    const country = typeof json.country === "string" ? json.country.trim() : "";
    const location = [city, country].filter(Boolean).join(", ");
    return location || UNKNOWN_LOCATION;
  } catch {
    return UNKNOWN_LOCATION;
  }
}

export function parseLoginLocation(details: string | null | undefined): string | null {
  if (!details) return null;
  try {
    const parsed = JSON.parse(details) as { location?: unknown };
    if (typeof parsed.location !== "string") return null;
    const location = parsed.location.trim();
    if (!location || location === UNKNOWN_LOCATION) return null;
    return location;
  } catch {
    return null;
  }
}

export function toSignInSnapshot(event: {
  createdAt: Date;
  ipAddress: string | null;
  details: string | null;
}): SignInSnapshot {
  return {
    at: event.createdAt.toISOString(),
    ip: normalizeClientIp(event.ipAddress),
    location: parseLoginLocation(event.details),
  };
}

export async function recordLoginAudit(userId: string, request: Request) {
  const ipAddress = clientIpFromRequest(request);
  let location = locationFromHeaders(request);
  if (!location) {
    location =
      !ipAddress || isPrivateIp(ipAddress)
        ? UNKNOWN_LOCATION
        : await lookupPublicLocation(ipAddress);
  }

  await prisma.auditEvent.create({
    data: {
      userId,
      action: "LOGIN",
      ipAddress,
      details: JSON.stringify({ location }),
    },
  });
}
