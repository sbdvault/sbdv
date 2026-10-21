import { prisma } from "@/lib/prisma";
import { sendNotifications } from "@/lib/email";
import { mandateForUserId, requireSignedIn } from "@/lib/wealth-access";
import { sendWealthInterestReinvestedEmail } from "@/lib/wealth-emails";
import {
  WEALTH_ENTRY,
  WEALTH_STATUS,
  deriveBalances,
  flushPendingInterest,
  roundUsd,
  serializeMandateWithProofs,
} from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const gate = await requireSignedIn();
  if ("error" in gate) return gate.error;

  const current = await mandateForUserId(gate.session.user.id);
  if (!current) {
    return NextResponse.json({ error: "No wealth mandate" }, { status: 404 });
  }

  const flushed = await flushPendingInterest(current.id);
  if (!flushed) {
    return NextResponse.json({ error: "No wealth mandate" }, { status: 404 });
  }

  const balances = deriveBalances(flushed.entries, flushed);
  const body = await request.json().catch(() => null);
  const requested = body?.amountUsd == null ? balances.accruedInterestUsd : roundUsd(Number(body.amountUsd));

  if (!Number.isFinite(requested) || requested <= 0) {
    return NextResponse.json({ error: "Nothing to reinvest" }, { status: 400 });
  }
  if (requested > balances.accruedInterestUsd + 0.001) {
    return NextResponse.json({ error: "Amount exceeds accrued interest" }, { status: 400 });
  }

  await prisma.wealthLedgerEntry.create({
    data: {
      mandateId: flushed.id,
      type: WEALTH_ENTRY.INTEREST_REINVEST,
      status: WEALTH_STATUS.CONFIRMED,
      amountUsd: requested,
      confirmedAt: new Date(),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: gate.session.user.id } });
  await sendNotifications([
    sendWealthInterestReinvestedEmail({
      email: user?.email || gate.session.user.email || "",
      name: user?.name || null,
      amountUsd: requested,
    }),
  ]);

  const fresh = await mandateForUserId(gate.session.user.id);
  return NextResponse.json({ mandate: fresh ? await serializeMandateWithProofs(fresh) : null });
}
