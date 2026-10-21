import { prisma } from "@/lib/prisma";
import { sendNotifications } from "@/lib/email";
import { requireAdminSession } from "@/lib/wealth-access";
import {
  sendWealthDepositRejectedEmails,
  sendWealthFundingConfirmedEmails,
  sendWealthInstructionsReadyEmails,
  sendWealthInterestPaidEmail,
} from "@/lib/wealth-emails";
import {
  MANDATE_STATUS,
  WEALTH_ENTRY,
  WEALTH_STATUS,
  countFundedMandates,
  encodeFundingAdminNote,
  flushPendingInterest,
  foundingBonusUsd,
  foundingClientCap,
  foundingBonusPct,
  hasConfirmedDeposit,
  isDepositType,
  loadPaymentProofs,
  mergeFundingAdminNote,
  roundUsd,
  serializeMandate,
  validateWealthBtcInput,
  validateWealthWireInput,
} from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

async function loadMandate(id: string) {
  return prisma.wealthMandate.findUnique({
    where: { id },
    include: {
      entries: true,
      clientProfile: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });
}

async function snapshot(mandate: NonNullable<Awaited<ReturnType<typeof loadMandate>>>) {
  const proofs = await loadPaymentProofs(mandate.clientProfileId);
  return {
    client: mandate.clientProfile.user,
    ...serializeMandate(mandate, new Date(), proofs),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminSession();
  if ("error" in gate) return gate.error;
  const { id } = await params;
  const mandate = await loadMandate(id);
  if (!mandate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ mandate: await snapshot(mandate) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminSession();
  if ("error" in gate) return gate.error;
  const { id } = await params;
  const existing = await loadMandate(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await flushPendingInterest(id);

  const body = await request.json().catch(() => null);
  const data: { annualYieldPct?: number; status?: string } = {};
  if (body?.annualYieldPct != null) {
    const rate = Number(body.annualYieldPct);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ error: "Invalid yield" }, { status: 400 });
    }
    data.annualYieldPct = roundUsd(rate);
  }
  if (body?.status) {
    if (body.status !== MANDATE_STATUS.ACTIVE && body.status !== MANDATE_STATUS.PAUSED) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  await prisma.wealthMandate.update({ where: { id }, data });
  await prisma.auditEvent.create({
    data: {
      userId: gate.session.user.id,
      action: "WEALTH_MANDATE_UPDATED",
      details: JSON.stringify({ mandateId: id, ...data }),
    },
  });

  const mandate = await loadMandate(id);
  return NextResponse.json({
    mandate: mandate ? await snapshot(mandate) : null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminSession();
  if ("error" in gate) return gate.error;
  const { id } = await params;
  const existing = await loadMandate(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const entryId = String(body?.entryId || "");
  const adminNote = String(body?.adminNote || "").trim() || null;
  const now = new Date();
  const client = existing.clientProfile.user;

  await flushPendingInterest(id);

  if (action === "send_instructions") {
    const entry = existing.entries.find((row) => row.id === entryId);
    if (!entry || !isDepositType(entry.type) || entry.status !== WEALTH_STATUS.PENDING) {
      return NextResponse.json({ error: "Deposit not pending" }, { status: 400 });
    }
    const checked =
      entry.type === WEALTH_ENTRY.DEPOSIT_BTC
        ? validateWealthBtcInput(body?.btcReceiveAddress)
        : validateWealthWireInput(body?.wire || {});
    if (!checked.ok) {
      return NextResponse.json({ error: checked.error }, { status: 400 });
    }
    await prisma.wealthLedgerEntry.update({
      where: { id: entry.id },
      data: {
        status: WEALTH_STATUS.INSTRUCTED,
        adminNote: encodeFundingAdminNote({ funding: checked.funding, note: adminNote }),
      },
    });
    await prisma.auditEvent.create({
      data: {
        userId: gate.session.user.id,
        action: "WEALTH_INSTRUCTIONS_SENT",
        details: JSON.stringify({ mandateId: id, entryId }),
      },
    });
    await sendNotifications([
      sendWealthInstructionsReadyEmails({
        email: client.email,
        name: client.name,
        amountUsd: entry.amountUsd,
        method: entry.type,
        reference: entry.paymentReference || entry.id,
      }),
    ]);
  } else if (action === "confirm_deposit") {
    const entry = existing.entries.find((row) => row.id === entryId);
    if (
      !entry ||
      !isDepositType(entry.type) ||
      (entry.status !== WEALTH_STATUS.PROOF_UPLOADED &&
        entry.status !== WEALTH_STATUS.INSTRUCTED)
    ) {
      return NextResponse.json({ error: "Deposit not ready to confirm" }, { status: 400 });
    }
    const amountUsd = body?.amountUsd != null ? roundUsd(Number(body.amountUsd)) : entry.amountUsd;
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return NextResponse.json({ error: "USD amount required" }, { status: 400 });
    }
    const usdPerBtc = body?.usdPerBtc != null ? Number(body.usdPerBtc) : entry.usdPerBtc;
    const btcTxid = String(body?.btcTxid || entry.btcTxid || "").trim() || null;
    if (entry.type === WEALTH_ENTRY.DEPOSIT_BTC && (!btcTxid || !(usdPerBtc && usdPerBtc > 0))) {
      return NextResponse.json(
        { error: "Bitcoin deposits need a txid and USD/BTC rate" },
        { status: 400 }
      );
    }

    const firstConfirm = !hasConfirmedDeposit(existing.entries);
    const fundedCount = firstConfirm ? await countFundedMandates() : foundingClientCap();
    const bonusEligible = firstConfirm && fundedCount < foundingClientCap();
    const bonusUsd = bonusEligible ? foundingBonusUsd(amountUsd) : 0;

    await prisma.wealthLedgerEntry.update({
      where: { id: entry.id },
      data: {
        status: WEALTH_STATUS.CONFIRMED,
        amountUsd,
        usdPerBtc: usdPerBtc && Number.isFinite(usdPerBtc) ? usdPerBtc : null,
        btcTxid,
        adminNote: mergeFundingAdminNote(entry.adminNote, adminNote),
        confirmedById: gate.session.user.id,
        confirmedAt: now,
      },
    });

    if (firstConfirm) {
      await prisma.wealthMandate.update({
        where: { id },
        data: { lastAccruedAt: now },
      });
    }

    if (bonusUsd > 0) {
      await prisma.wealthLedgerEntry.create({
        data: {
          mandateId: id,
          type: WEALTH_ENTRY.FOUNDING_BONUS,
          status: WEALTH_STATUS.CONFIRMED,
          amountUsd: bonusUsd,
          adminNote: `Founding client bonus (${foundingBonusPct()}%) on first confirmed deposit`,
          confirmedById: gate.session.user.id,
          confirmedAt: now,
        },
      });
    }

    await prisma.auditEvent.create({
      data: {
        userId: gate.session.user.id,
        action: "WEALTH_DEPOSIT_CONFIRMED",
        details: JSON.stringify({ mandateId: id, entryId, amountUsd, bonusUsd }),
      },
    });
    await sendNotifications([
      sendWealthFundingConfirmedEmails({
        email: client.email,
        name: client.name,
        amountUsd,
        method: entry.type,
        bonusUsd,
      }),
    ]);
  } else if (action === "reject_deposit" || action === "reject_withdrawal") {
    const entry = existing.entries.find((row) => row.id === entryId);
    const rejectable =
      action === "reject_deposit"
        ? entry &&
          isDepositType(entry.type) &&
          (entry.status === WEALTH_STATUS.PENDING ||
            entry.status === WEALTH_STATUS.INSTRUCTED ||
            entry.status === WEALTH_STATUS.PROOF_UPLOADED)
        : entry && entry.status === WEALTH_STATUS.PENDING;
    if (!entry || !rejectable) {
      return NextResponse.json({ error: "Entry not pending" }, { status: 400 });
    }
    await prisma.wealthLedgerEntry.update({
      where: { id: entry.id },
      data: {
        status: WEALTH_STATUS.REJECTED,
        adminNote: isDepositType(entry.type)
          ? mergeFundingAdminNote(entry.adminNote, adminNote)
          : adminNote,
        confirmedById: gate.session.user.id,
        confirmedAt: now,
      },
    });
    if (action === "reject_deposit") {
      await sendNotifications([
        sendWealthDepositRejectedEmails({
          email: client.email,
          name: client.name,
          amountUsd: entry.amountUsd,
          method: entry.type,
          reference: entry.paymentReference,
          adminNote,
        }),
      ]);
    }
  } else if (action === "pay_withdrawal") {
    const entry = existing.entries.find((row) => row.id === entryId);
    if (
      !entry ||
      entry.type !== WEALTH_ENTRY.INTEREST_WITHDRAW ||
      entry.status !== WEALTH_STATUS.PENDING
    ) {
      return NextResponse.json({ error: "Withdrawal not pending" }, { status: 400 });
    }
    await prisma.wealthLedgerEntry.update({
      where: { id: entry.id },
      data: {
        status: WEALTH_STATUS.PAID,
        adminNote,
        confirmedById: gate.session.user.id,
        confirmedAt: now,
      },
    });
    await prisma.auditEvent.create({
      data: {
        userId: gate.session.user.id,
        action: "WEALTH_INTEREST_PAID",
        details: JSON.stringify({ mandateId: id, entryId, amountUsd: entry.amountUsd }),
      },
    });
    await sendNotifications([
      sendWealthInterestPaidEmail({
        email: client.email,
        name: client.name,
        amountUsd: entry.amountUsd,
      }),
    ]);
  } else if (action === "adjustment") {
    const amountUsd = roundUsd(Number(body?.amountUsd));
    if (!Number.isFinite(amountUsd) || amountUsd === 0) {
      return NextResponse.json({ error: "Adjustment amount required" }, { status: 400 });
    }
    await prisma.wealthLedgerEntry.create({
      data: {
        mandateId: id,
        type: WEALTH_ENTRY.ADJUSTMENT,
        status: WEALTH_STATUS.CONFIRMED,
        amountUsd,
        adminNote,
        confirmedById: gate.session.user.id,
        confirmedAt: now,
      },
    });
    await prisma.auditEvent.create({
      data: {
        userId: gate.session.user.id,
        action: "WEALTH_ADJUSTMENT",
        details: JSON.stringify({ mandateId: id, amountUsd }),
      },
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const mandate = await loadMandate(id);
  return NextResponse.json({
    mandate: mandate ? await snapshot(mandate) : null,
  });
}
