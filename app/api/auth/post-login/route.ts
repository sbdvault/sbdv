import { auth } from "@/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
import {
  adminHomeHref,
  deriveAdminOrigin,
  isAdminRequest,
  requestHostname,
  shouldBounceAdminLogin,
} from "@/lib/admin-host";
import { pathForRole } from "@/lib/role-paths";
import {
  jwtEmail,
  publicOrigin,
  readAllAuthTokens,
  redirectToAppPath,
} from "@/lib/request-origin";
import { NextRequest, NextResponse } from "next/server";

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

function withClearedCookies(response: NextResponse): NextResponse {
  clearAuthCookies(response);
  return response;
}

/**
 * Redirect after credentials sign-in.
 * `email=` is required to pick the correct role when multiple cookies exist.
 * Never fall back to another user's role (that sent borrowers to /admin).
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
    // 1) Prefer a JWT whose email matches the account that just signed in.
    const matched = tokens.find((token) => jwtEmail(token) === expectedEmail);
    if (matched && typeof matched.role === "string") {
      role = matched.role;
    }

    // 2) Or Auth.js session for that same email.
    if (!role && sessionEmail === expectedEmail && sessionRole) {
      role = sessionRole;
    }

    // 3) Session/JWT has a role but no email claim — only accept if nothing
    //    identifies a *different* user.
    if (!role && sessionRole) {
      const foreignEmail = tokens.some((token) => {
        const email = jwtEmail(token);
        return Boolean(email && email !== expectedEmail);
      });
      if (!sessionEmail && !foreignEmail) {
        role = sessionRole;
      }
    }

    // Wrong user still in cookies — wipe and force a clean login.
    if (!role) {
      return withClearedCookies(
        redirectToAppPath(
          request,
          isAdminRequest(request) ? "/login" : `/${locale}/login`,
          "?error=session"
        )
      );
    }
  } else {
    role =
      sessionRole ||
      (typeof tokens[0]?.role === "string" ? tokens[0].role : undefined);
    if (!role) {
      return redirectToAppPath(
        request,
        isAdminRequest(request) ? "/login" : `/${locale}/login`,
        "?error=session"
      );
    }
  }

  if (role === "ADMIN") {
    if (isAdminRequest(request)) {
      return redirectToAppPath(request, "/");
    }
    const origin = publicOrigin(request);
    if (!shouldBounceAdminLogin(requestHostname(request))) {
      return redirectToAppPath(request, adminHomeHref(locale, origin));
    }
    const email = expectedEmail || sessionEmail || "";
    const login = `${deriveAdminOrigin(origin)}/login${
      email ? `?email=${encodeURIComponent(email)}` : ""
    }`;
    return withClearedCookies(NextResponse.redirect(login));
  }

  return redirectToAppPath(request, pathForRole(locale, role));
}
