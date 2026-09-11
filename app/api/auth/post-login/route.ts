import { auth } from "@/auth";
import {
  jwtEmail,
  readAllAuthTokens,
  redirectToAppPath,
} from "@/lib/request-origin";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const locales = new Set([
  "en",
  "de",
  "fr",
  "it",
  "nl",
  "es",
  "pt",
  "ru",
  "zh",
  "ja",
  "ko",
  "ar",
]);

function pathForRole(locale: string, role: string | undefined): string {
  if (role === "ADMIN") return `/${locale}/admin`;
  if (role === "BORROWER") return `/${locale}/capital-access/portal`;
  return `/${locale}/portal`;
}

/**
 * Full-page redirect after credentials sign-in.
 * Prefer the JWT/session whose email matches `email=` so a leftover cookie for
 * another role cannot send the user to the wrong portal.
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") || "en";
  const locale = locales.has(localeParam) ? localeParam : "en";
  const expectedEmail =
    request.nextUrl.searchParams.get("email")?.trim().toLowerCase() || null;

  const session = await auth();
  const tokens = await readAllAuthTokens(request);
  const sessionEmail = session?.user?.email?.toLowerCase() || null;
  const sessionRole = session?.user?.role;

  let role: string | undefined;

  if (expectedEmail) {
    const matched = tokens.find((token) => jwtEmail(token) === expectedEmail);
    if (matched && typeof matched.role === "string") {
      role = matched.role;
    } else if (sessionEmail === expectedEmail && sessionRole) {
      role = sessionRole;
    } else if (sessionRole && !sessionEmail) {
      // Email claim missing on session — trust Auth.js session after sign-in.
      role = sessionRole;
    } else if (!sessionEmail || sessionEmail === expectedEmail) {
      const withRole = tokens.find((token) => typeof token.role === "string");
      if (withRole && typeof withRole.role === "string") role = withRole.role;
      else if (sessionRole) role = sessionRole;
    } else if (typeof tokens[0]?.role === "string") {
      // Dual cookies: prefer the secure/primary cookie (first in list).
      role = tokens[0].role;
    }
  } else {
    role =
      sessionRole ||
      (typeof tokens[0]?.role === "string" ? tokens[0].role : undefined);
  }

  if (!role) {
    return redirectToAppPath(request, `/${locale}/login`, "?error=session");
  }

  return redirectToAppPath(request, pathForRole(locale, role));
}
