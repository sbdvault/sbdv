import { auth } from "@/auth";
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
 * Redirects use the public origin (AUTH_URL / x-forwarded-host), not
 * https://0.0.0.0:8080 from the container bind address.
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") || "en";
  const locale = locales.has(localeParam) ? localeParam : "en";

  const session = await auth();
  let role = session?.user?.role;

  if (!role) {
    const token = await readAuthToken(request);
    role = typeof token?.role === "string" ? token.role : undefined;
  }

  if (!role) {
    return redirectToAppPath(request, `/${locale}/login`, "?error=session");
  }

  return redirectToAppPath(request, pathForRole(locale, role));
}
