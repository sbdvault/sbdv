import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

function withNoStore(response: Response) {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    headers.set(key, value);
  });
  // Headers() drops extra Set-Cookie values. Auth.js sets the CSRF and session
  // cookies together; losing one makes the first sign-in fail and the second work.
  const cookies =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const cookie of cookies) {
    headers.append("set-cookie", cookie);
  }
  for (const [key, value] of Object.entries(noStore)) {
    headers.set(key, value);
  }
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: NextRequest) {
  return withNoStore(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return withNoStore(await handlers.POST(request));
}
