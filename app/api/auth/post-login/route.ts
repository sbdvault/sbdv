import { auth } from "@/auth";
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

/**
 * Full-page redirect after credentials sign-in.
 * Prefer this over a same-tick fetch("/api/auth/destination") — the session
 * cookie from signIn is always attached on a top-level navigation.
 */
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") || "en";
  const locale = locales.has(localeParam) ? localeParam : "en";
  const loginUrl = new URL(`/${locale}/login`, request.url);

  const session = await auth();
  if (!session?.user?.role) {
    loginUrl.searchParams.set("error", "session");
    return NextResponse.redirect(loginUrl);
  }

  let path = `/${locale}/portal`;
  if (session.user.role === "ADMIN") {
    path = `/${locale}/admin`;
  } else if (session.user.role === "BORROWER") {
    path = `/${locale}/capital-access/portal`;
  }

  return NextResponse.redirect(new URL(path, request.url));
}
