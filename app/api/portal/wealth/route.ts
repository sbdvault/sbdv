import { mandateForUserId, requireSignedIn } from "@/lib/wealth-access";
import { serializeMandateWithProofs } from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireSignedIn();
  if ("error" in gate) return gate.error;

  const mandate = await mandateForUserId(gate.session.user.id);
  if (!mandate) {
    return NextResponse.json({ error: "No wealth mandate" }, { status: 404 });
  }

  return NextResponse.json({ mandate: await serializeMandateWithProofs(mandate) });
}
