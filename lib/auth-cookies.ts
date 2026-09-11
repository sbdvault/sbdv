import { NextResponse } from "next/server";

/** All Auth.js / legacy NextAuth cookie names we may have set across http/https. */
export const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.csrf-token",
  "__Secure-authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.pkce.code_verifier",
  "__Secure-authjs.pkce.code_verifier",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
] as const;

/**
 * Expire every known auth cookie so a prior admin session cannot survive logout.
 * Clear each name under multiple Secure flag combinations — browsers only drop
 * a cookie when the clear attributes match how it was originally set.
 */
export function clearAuthCookies(response: NextResponse): void {
  for (const name of AUTH_COOKIE_NAMES) {
    const mustSecure =
      name.startsWith("__Secure-") || name.startsWith("__Host-");
    const secureOptions = mustSecure ? [true] : [true, false];

    for (const secure of secureOptions) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
        secure,
      });
    }
  }
}
