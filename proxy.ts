import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
    // Behind Amvera TLS, the app often sees http:// internally while Auth.js
    // still sets `__Secure-authjs.session-token`. Without secureCookie:true,
    // getToken misses the cookie → bounce back to /login after a successful sign-in.
    const useSecureCookies =
      (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith(
        "https://"
      ) ||
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl.protocol === "https:";

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: useSecureCookies,
    });

    const locale = pathname.split("/")[1] || defaultLocale;

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (isAdmin && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
    }

    if (isCapitalPortal && token.role !== "BORROWER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/portal`, request.url));
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
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*|favicon.ico).*)"],
};
