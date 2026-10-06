"use client";

import { signOut } from "next-auth/react";

/**
 * Sign out, wipe every Auth.js cookie variant, then full-page navigate.
 * Full navigation avoids a soft client transition that can keep a stale JWT.
 */
export async function hardSignOut(callbackUrl: string) {
  try {
    await signOut({ redirect: false });
  } catch {
    /* still clear cookies */
  }
  try {
    await fetch("/api/auth/clear-session", { method: "POST", cache: "no-store" });
  } catch {
    /* still leave */
  }
  window.location.assign(callbackUrl);
}
