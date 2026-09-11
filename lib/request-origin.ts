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

/**
 * Public site origin for emails / absolute URLs.
 * Never use request.url on Layero — Next listens on 0.0.0.0:8080 inside the container.
 */
export function publicOrigin(request: NextRequest): string {
  for (const raw of [process.env.AUTH_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (!isUnusablePublicHost(url.host)) return url.origin;
    } catch {
      /* ignore invalid env */
    }
  }

  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const xfProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (xfHost && !isUnusablePublicHost(xfHost)) {
    return `${xfProto}://${xfHost}`;
  }

  const host = request.headers.get("host");
  if (host && !isUnusablePublicHost(host)) {
    const proto = xfProto || request.nextUrl.protocol.replace(":", "") || "https";
    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}

/**
 * Same-origin 307. Relative Location keeps the browser on the public host even
 * when Next's request.url is https://0.0.0.0:8080.
 */
export function redirectToAppPath(path: string, search = ""): NextResponse {
  const location = `${path}${search}`;
  return new NextResponse(null, {
    status: 307,
    headers: { Location: location },
  });
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

/** Read the Auth.js JWT even if cookie prefix (__Secure- vs plain) doesn't match request.url. */
export async function readAuthToken(request: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET;
  const preferred = authUsesSecureCookies(request);
  for (const secureCookie of [preferred, !preferred]) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (token?.sub || token?.id || token?.role) return token;
  }
  return null;
}
