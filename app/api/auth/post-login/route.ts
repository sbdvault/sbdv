import { auth } from "@/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
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
 *
 * Pass `email=` (the address just signed in) so a leftover admin cookie cannot
 * send a borrower to /admin. On Layero, JWT email claims are sometimes missing
 * even after a successful sign-in — fall back to the sole valid role cookie.
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
    if (sessionEmail === expectedEmail && sessionRole) {
      role = sessionRole;
    }

    if (!role) {
      const matched = tokens.find((token) => jwtEmail(token) === expectedEmail);
      if (matched && typeof matched.role === "string") {
        role = matched.role;
      }
    }

    // Production JWTs sometimes omit email after credentials sign-in.
    // If nothing contradicts expectedEmail, accept the only available role.
    if (!role) {
      const wrongSession = sessionEmail && sessionEmail !== expectedEmail;
      const wrongToken = tokens.some((token) => {
        const email = jwtEmail(token);
        return Boolean(email && email !== expectedEmail);
      });

      if (!wrongSession && !wrongToken) {
        if (sessionRole) {
          role = sessionRole;
        } else {
          const withRole = tokens.find((token) => typeof token.role === "string");
          if (withRole && typeof withRole.role === "string") {
            role = withRole.role;
          }
        }
      }
    }
  } else {
    role =
      sessionRole ||
      (typeof tokens[0]?.role === "string" ? tokens[0].role : undefined);
  }

  if (!role) {
    const response = redirectToAppPath(request, `/${locale}/login`, "?error=session");
    // Stale dual cookies for a different user — wipe and force a clean login.
    if (
      expectedEmail &&
      ((sessionEmail && sessionEmail !== expectedEmail) ||
        tokens.some((token) => {
          const email = jwtEmail(token);
          return Boolean(email && email !== expectedEmail);
        }))
    ) {
      clearAuthCookies(response);
    }
    return response;
  }

  return redirectToAppPath(request, pathForRole(locale, role));
}
