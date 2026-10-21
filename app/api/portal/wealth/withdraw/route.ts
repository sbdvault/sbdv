import { prisma } from "@/lib/prisma";
import { mandateForUserId, requireSignedIn } from "@/lib/wealth-access";
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
  const amountUsd = roundUsd(Number(body?.amountUsd));
  const payoutMethod = String(body?.payoutMethod || "").toUpperCase();

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "Enter an amount" }, { status: 400 });
  }
  if (amountUsd > balances.accruedInterestUsd + 0.001) {
    return NextResponse.json({ error: "Amount exceeds accrued interest" }, { status: 400 });
  }
  if (payoutMethod !== "WIRE" && payoutMethod !== "BTC") {
    return NextResponse.json({ error: "Choose wire or Bitcoin payout" }, { status: 400 });
  }

  const payoutBankName = String(body?.payoutBankName || "").trim() || null;
  const payoutIban = String(body?.payoutIban || "").trim() || null;
  const payoutSwift = String(body?.payoutSwift || "").trim() || null;
  const payoutAccountName = String(body?.payoutAccountName || "").trim() || null;
  const payoutBtcAddress = String(body?.payoutBtcAddress || "").trim() || null;
  const clientNote = String(body?.clientNote || "").trim() || null;

  if (payoutMethod === "WIRE" && !payoutIban && !payoutBankName) {
    return NextResponse.json({ error: "Provide payout bank details" }, { status: 400 });
  }
  if (payoutMethod === "BTC" && !payoutBtcAddress) {
    return NextResponse.json({ error: "Provide a Bitcoin payout address" }, { status: 400 });
  }

  await prisma.wealthLedgerEntry.create({
    data: {
      mandateId: flushed.id,
      type: WEALTH_ENTRY.INTEREST_WITHDRAW,
      status: WEALTH_STATUS.PENDING,
      amountUsd,
      payoutMethod,
      payoutBankName,
      payoutIban,
      payoutSwift,
      payoutAccountName,
      payoutBtcAddress,
      clientNote,
    },
  });

  const fresh = await mandateForUserId(gate.session.user.id);
  return NextResponse.json({ mandate: fresh ? await serializeMandateWithProofs(fresh) : null }, { status: 201 });
}
