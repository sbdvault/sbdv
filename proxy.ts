import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const locales = ["en", "nl", "fr", "it"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

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

  const isPortal = /\/(en|nl|fr|it)\/portal/.test(pathname);
  const isAdmin = /\/(en|nl|fr|it)\/admin/.test(pathname);
  const isCapitalPortal = /\/(en|nl|fr|it)\/capital-access\/portal/.test(pathname);

  if (isPortal || isAdmin || isCapitalPortal) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
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
