import { auth } from "@/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { readAuthToken, redirectToAppPath } from "@/lib/request-origin";
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
 * Prefer this over a same-tick fetch("/api/auth/destination") — the session
 * cookie from signIn is always attached on a top-level navigation.
 *
 * Pass `email=` (the address just signed in) so a leftover admin cookie cannot
 * send a borrower to /admin.
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") || "en";
  const locale = locales.has(localeParam) ? localeParam : "en";
  const expectedEmail = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() || null;

  const session = await auth();
  const token = await readAuthToken(request, expectedEmail);

  const sessionEmail = session?.user?.email?.toLowerCase() || null;
  const tokenEmail =
    typeof token?.email === "string" ? token.email.toLowerCase() : null;

  let role: string | undefined;

  if (expectedEmail) {
    if (sessionEmail === expectedEmail && session?.user?.role) {
      role = session.user.role;
    } else if (tokenEmail === expectedEmail && typeof token?.role === "string") {
      role = token.role;
    }
  } else {
    role = session?.user?.role || (typeof token?.role === "string" ? token.role : undefined);
  }

  if (!role) {
    const response = redirectToAppPath(request, `/${locale}/login`, "?error=session");
    // Stale dual cookies — wipe and force a clean login.
    if (expectedEmail && (sessionEmail || tokenEmail) && sessionEmail !== expectedEmail) {
      clearAuthCookies(response);
    }
    return response;
  }

  return redirectToAppPath(request, pathForRole(locale, role));
}
