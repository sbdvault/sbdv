import { NextRequest, NextResponse } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";

export function isUnusablePublicHost(host: string): boolean {
  try {
    const name = new URL(host.includes("://") ? host : `http://${host}`).hostname.toLowerCase();
    return name === "0.0.0.0" || name === "::" || name === "";
  } catch {
    return true;
  }
}

function forwardedProto(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    request.nextUrl.protocol.replace(":", "") ||
    "https"
  );
}

/**
 * Origin the process actually bound to (often https://0.0.0.0:8080 on Layero).
 * Valid for `new URL(path, base)` and for container health checks.
 */
export function listenOrigin(request: NextRequest): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return request.nextUrl.origin;
  }
}

/**
 * Origin the browser should be sent to. Prefer forwarded / AUTH_URL hosts;
 * fall back to the listen origin so Next.js never sees a relative URL.
 */
export function publicOrigin(request: NextRequest): string {
  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (xfHost && !isUnusablePublicHost(xfHost)) {
    return `${forwardedProto(request)}://${xfHost}`;
  }

  const host = request.headers.get("host");
  if (host && !isUnusablePublicHost(host)) {
    return `${forwardedProto(request)}://${host}`;
  }

  for (const raw of [process.env.AUTH_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (!isUnusablePublicHost(url.host)) return url.origin;
    } catch {
      /* ignore invalid env */
    }
  }

  return listenOrigin(request);
}

function asAbsoluteUrl(path: string, search: string, base: string): URL {
  return new URL(`${path}${search}`, base.endsWith("/") ? base : `${base}/`);
}

/**
 * Next.js (and Node's URL) reject relative Location values like `/en/`.
 * Always pass an absolute URL. Use the public origin for browser-facing
 * auth hops; use the listen origin for `/` → `/en` so Layero's probe
 * stays on 0.0.0.0 inside the container.
 */
export function redirectToAppPath(
  request: NextRequest,
  path: string,
  search = "",
  origin: "public" | "listen" = "public"
): NextResponse {
  const base = origin === "listen" ? listenOrigin(request) : publicOrigin(request);
  return NextResponse.redirect(asAbsoluteUrl(path, search, base));
}

export function authUsesSecureCookies(request: NextRequest): boolean {
  return (
    (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith(
      "https://"
    ) ||
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https" ||
    request.nextUrl.protocol === "https:"
  );
}

/** Collect Auth.js JWTs from both secure and non-secure cookie names. */
export async function readAllAuthTokens(request: NextRequest): Promise<JWT[]> {
  const secret = process.env.AUTH_SECRET;
  const preferred = authUsesSecureCookies(request);
  const seen = new Set<string>();
  const candidates: JWT[] = [];

  for (const secureCookie of [preferred, !preferred]) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (!token || !(token.sub || token.id || token.role || token.email)) continue;
    const key = `${String(token.sub || token.id || "")}:${String(token.role || "")}:${String(token.email || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(token);
  }

  return candidates;
}

function jwtEmail(token: JWT | null | undefined): string | null {
  if (!token) return null;
  if (typeof token.email === "string" && token.email.trim()) {
    return token.email.trim().toLowerCase();
  }
  return null;
}

/** Read the Auth.js JWT even if cookie prefix (__Secure- vs plain) doesn't match request.url.
 * When `preferEmail` is set, pick the token for that user — avoids sending a borrower
 * to /admin because a leftover admin cookie is still present.
 */
export async function readAuthToken(
  request: NextRequest,
  preferEmail?: string | null
): Promise<JWT | null> {
  const candidates = await readAllAuthTokens(request);
  if (!candidates.length) return null;

  if (preferEmail) {
    const want = preferEmail.trim().toLowerCase();
    const match = candidates.find((token) => jwtEmail(token) === want);
    if (match) return match;
  }

  return candidates[0];
}

export { jwtEmail };
