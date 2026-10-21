import { prisma } from "@/lib/prisma";
import { sendNotifications } from "@/lib/email";
import { mandateForUserId, requireSignedIn } from "@/lib/wealth-access";
import { sendWealthFundingNoticeEmails } from "@/lib/wealth-emails";
import {
  WEALTH_ENTRY,
  WEALTH_STATUS,
  newFundingReference,
  roundUsd,
  serializeMandateWithProofs,
} from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const gate = await requireSignedIn();
  if ("error" in gate) return gate.error;

  const mandate = await mandateForUserId(gate.session.user.id);
  if (!mandate) {
    return NextResponse.json({ error: "No wealth mandate" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const method = String(body?.method || "").toUpperCase();
  const amountUsd = roundUsd(Number(body?.amountUsd));
  const btcAmount = body?.btcAmount != null ? Number(body.btcAmount) : null;
  const btcTxid = String(body?.btcTxid || "").trim() || null;
  const clientNote = String(body?.clientNote || "").trim() || null;

  if (method !== "WIRE" && method !== "BTC") {
    return NextResponse.json({ error: "Choose wire or Bitcoin" }, { status: 400 });
  }
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "Enter a USD amount" }, { status: 400 });
  }
  if (method === "BTC" && btcAmount != null && (!Number.isFinite(btcAmount) || btcAmount <= 0)) {
    return NextResponse.json({ error: "Bitcoin amount is invalid" }, { status: 400 });
  }

  const type = method === "BTC" ? WEALTH_ENTRY.DEPOSIT_BTC : WEALTH_ENTRY.DEPOSIT_WIRE;
  const paymentReference = newFundingReference(mandate.id);

  await prisma.wealthLedgerEntry.create({
    data: {
      mandateId: mandate.id,
      type,
      status: WEALTH_STATUS.PENDING,
      amountUsd,
      btcAmount: method === "BTC" && btcAmount ? btcAmount : null,
      btcTxid,
      clientNote,
      paymentReference,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: gate.session.user.id } });
  await sendNotifications([
    sendWealthFundingNoticeEmails({
      email: user?.email || gate.session.user.email || "",
      name: user?.name || null,
      amountUsd,
      method: type,
      reference: paymentReference,
    }),
  ]);

  const fresh = await mandateForUserId(gate.session.user.id);
  return NextResponse.json(
    {
      mandate: fresh ? await serializeMandateWithProofs(fresh) : null,
      reference: paymentReference,
    },
    { status: 201 }
  );
}
