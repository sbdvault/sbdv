import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Clears every Auth.js cookie variant (secure + non-secure).
 * Call before a fresh sign-in and after logout so roles cannot stick.
 */
export async function POST() {
  const response = NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    }
  );
  clearAuthCookies(response);
  return response;
}
