import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readAuthToken, redirectToAppPath } from "@/lib/request-origin";

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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPortal = portalAuthPath.test(pathname);
  const isAdmin = adminAuthPath.test(pathname);
  const isCapitalPortal = capitalAuthPath.test(pathname);

  if (isPortal || isAdmin || isCapitalPortal) {
    // Behind Layero/Amvera TLS, Next often sees http://0.0.0.0 internally while
    // Auth.js still sets `__Secure-authjs.session-token`. Try both cookie names.
    const token = await readAuthToken(request);

    const locale = pathname.split("/")[1] || defaultLocale;

    if (!token) {
      return redirectToAppPath(`/${locale}/login`);
    }

    if (isAdmin && token.role !== "ADMIN") {
      return redirectToAppPath(`/${locale}/portal`);
    }

    if (isCapitalPortal && token.role !== "BORROWER" && token.role !== "ADMIN") {
      return redirectToAppPath(`/${locale}/portal`);
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
    `/${locale}${pathname}`,
    request.nextUrl.search
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
