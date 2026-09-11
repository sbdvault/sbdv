"use client";

import { signOut } from "next-auth/react";

/** Sign out and wipe every Auth.js cookie variant before leaving. */
export async function hardSignOut(callbackUrl: string) {
  try {
    await fetch("/api/auth/clear-session", { method: "POST", cache: "no-store" });
  } catch {
    /* still sign out */
  }
  await signOut({ callbackUrl });
}
