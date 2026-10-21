import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readAuthToken, redirectToAppPath, publicOrigin } from "@/lib/request-origin";
import {
  ADMIN_DEFAULT_LOCALE,
  adminHostRewritePath,
  deriveAdminOrigin,
  isAdminLoginPath,
  isAdminRequest,
  isPublicAdminPath,
  publicAdminPathToHostPath,
} from "@/lib/admin-host";

export const locales = [
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
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Locales that render right-to-left */
export const rtlLocales: readonly Locale[] = ["ar"];

const localePathPattern = locales.join("|");
const portalAuthPath = new RegExp(`^/(${localePathPattern})/portal(/|$)`);
const adminAuthPath = new RegExp(`^/(${localePathPattern})/admin(/|$)`);
const capitalAuthPath = new RegExp(
  `^/(${localePathPattern})/capital-access/portal(/|$)`
);

function getLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase().substring(0, 2));

    for (const lang of preferredLanguages) {
      if (locales.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
  }

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  return defaultLocale;
}

function rewritePath(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

async function handleAdminHost(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (isAdminLoginPath(pathname)) {
    const internal = adminHostRewritePath(pathname, ADMIN_DEFAULT_LOCALE);
    if (internal !== pathname) return rewritePath(request, internal);
    return NextResponse.next();
  }

  const token = await readAuthToken(request);

  if (!token) {
    return redirectToAppPath(request, "/login");
  }

  if (token.role !== "ADMIN") {
    return redirectToAppPath(request, "/login", "?error=forbidden");
  }

  if (adminAuthPath.test(pathname)) {
    return NextResponse.next();
  }

  return rewritePath(
    request,
    adminHostRewritePath(pathname, ADMIN_DEFAULT_LOCALE)
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isAdminRequest(request)) {
    return handleAdminHost(request);
  }

  if (isPublicAdminPath(pathname)) {
    const dest = `${deriveAdminOrigin(publicOrigin(request))}${publicAdminPathToHostPath(pathname)}${request.nextUrl.search}`;
    return NextResponse.redirect(dest, 307);
  }

  const isPortal = portalAuthPath.test(pathname);
  const isCapitalPortal = capitalAuthPath.test(pathname);

  if (isPortal || isCapitalPortal) {
    const token = await readAuthToken(request);
    const locale = pathname.split("/")[1] || defaultLocale;

    if (!token) {
      return redirectToAppPath(request, `/${locale}/login`);
    }

    if (isCapitalPortal && token.role !== "BORROWER" && token.role !== "ADMIN") {
      return redirectToAppPath(request, `/${locale}/portal`);
    }
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathnameHasLocale
  ) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const response = redirectToAppPath(
    request,
    `/${locale}${pathname}`,
    request.nextUrl.search,
    "listen"
  );
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*|favicon.ico).*)"],
};
