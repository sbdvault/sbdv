import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

/** Role of the cookie just set by sign-in. POST so hosts cannot reuse a cached session. */
export async function POST() {
  const session = await auth();
  return NextResponse.json(
    {
      email: session?.user?.email ?? null,
      role: session?.user?.role ?? null,
    },
    { headers: noStore }
  );
}
