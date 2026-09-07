import { handlers } from "@/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(noStore)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function POST(request: NextRequest) {
  const response = await handlers.POST(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(noStore)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
