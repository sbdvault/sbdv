import { prisma } from "./prisma";
import { validateEscrowInput } from "./capital-access-onboarding";

export const WEALTH_ENTRY = {
  DEPOSIT_WIRE: "DEPOSIT_WIRE",
  DEPOSIT_BTC: "DEPOSIT_BTC",
  INTEREST_ACCRUAL: "INTEREST_ACCRUAL",
  INTEREST_WITHDRAW: "INTEREST_WITHDRAW",
  INTEREST_REINVEST: "INTEREST_REINVEST",
  ADJUSTMENT: "ADJUSTMENT",
  FOUNDING_BONUS: "FOUNDING_BONUS",
} as const;

export const WEALTH_STATUS = {
  PENDING: "PENDING",
  INSTRUCTED: "INSTRUCTED",
  PROOF_UPLOADED: "PROOF_UPLOADED",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  PAID: "PAID",
} as const;

export const WEALTH_PAYMENT_DOC_TYPE = "WEALTH_PAYMENT";

export type PaymentProof = { id: string; name: string; filePath: string };

export type WireInstructions = {
  bankName: string;
  bankAddress: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  routing: string;
  beneficiary: string;
  beneficiaryAddress: string;
  configured: boolean;
};

export type EntryFunding = {
  wire: WireInstructions;
  btcReceiveAddress: string;
};

type FundingEnvelope = {
  funding?: {
    wire?: Partial<Omit<WireInstructions, "configured">>;
    btcReceiveAddress?: string;
  };
  note?: string;
};

export const MANDATE_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
} as const;

export type LedgerLike = {
  type: string;
  status: string;
  amountUsd: number;
  createdAt?: Date;
};

export function defaultYieldPct(): number {
  const n = Number(process.env.WEALTH_DEFAULT_YIELD_PCT);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 8;
}

export function roundUsd(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function foundingBonusPct(): number {
  const n = Number(process.env.WEALTH_FOUNDING_BONUS_PCT);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 10;
}

export function foundingClientCap(): number {
  const n = Number(process.env.WEALTH_FOUNDING_CLIENT_CAP);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1000;
}

export function foundingBonusUsd(amountUsd: number): number {
  return roundUsd(amountUsd * (foundingBonusPct() / 100));
}

export function isDepositType(type: string): boolean {
  return type === WEALTH_ENTRY.DEPOSIT_WIRE || type === WEALTH_ENTRY.DEPOSIT_BTC;
}

export function instructionsReleased(entry: { type: string; status: string }): boolean {
  return (
    isDepositType(entry.type) &&
    (entry.status === WEALTH_STATUS.INSTRUCTED ||
      entry.status === WEALTH_STATUS.PROOF_UPLOADED ||
      entry.status === WEALTH_STATUS.CONFIRMED)
  );
}

export function hasConfirmedDeposit(entries: Array<{ type: string; status: string }>): boolean {
  return entries.some(
    (entry) => isDepositType(entry.type) && entry.status === WEALTH_STATUS.CONFIRMED
  );
}

export async function countFundedMandates(): Promise<number> {
  return prisma.wealthMandate.count({
    where: {
      entries: {
        some: {
          status: WEALTH_STATUS.CONFIRMED,
          type: { in: [WEALTH_ENTRY.DEPOSIT_WIRE, WEALTH_ENTRY.DEPOSIT_BTC] },
        },
      },
    },
  });
}

export function emptyWireInstructions(): WireInstructions {
  return {
    bankName: "",
    bankAddress: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    swift: "",
    routing: "",
    beneficiary: "",
    beneficiaryAddress: "",
    configured: false,
  };
}

export function emptyFundingInstructions(): EntryFunding {
  return {
    wire: emptyWireInstructions(),
    btcReceiveAddress: "",
  };
}

function wireFromPartial(input?: Partial<Omit<WireInstructions, "configured">> | null): WireInstructions {
  const wire = {
    bankName: input?.bankName?.trim() || "",
    bankAddress: input?.bankAddress?.trim() || "",
    accountName: input?.accountName?.trim() || "",
    accountNumber: input?.accountNumber?.trim() || "",
    iban: input?.iban?.trim() || "",
    swift: input?.swift?.trim() || "",
    routing: input?.routing?.trim() || "",
    beneficiary: input?.beneficiary?.trim() || "",
    beneficiaryAddress: input?.beneficiaryAddress?.trim() || "",
  };
  return {
    ...wire,
    configured: Boolean(wire.iban || wire.accountNumber || wire.bankName),
  };
}

export function parseFundingFromAdminNote(adminNote: string | null | undefined): {
  funding: EntryFunding;
  note: string | null;
} {
  if (!adminNote?.trim()) {
    return { funding: emptyFundingInstructions(), note: null };
  }
  try {
    const parsed = JSON.parse(adminNote) as FundingEnvelope;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.funding) {
      return { funding: emptyFundingInstructions(), note: adminNote };
    }
    return {
      funding: {
        wire: wireFromPartial(parsed.funding.wire),
        btcReceiveAddress: parsed.funding.btcReceiveAddress?.trim() || "",
      },
      note: parsed.note?.trim() || null,
    };
  } catch {
    return { funding: emptyFundingInstructions(), note: adminNote };
  }
}

export function encodeFundingAdminNote(params: {
  funding: EntryFunding;
  note?: string | null;
}): string {
  const envelope: FundingEnvelope = {
    funding: {
      wire: params.funding.wire.configured ? { ...params.funding.wire } : undefined,
      btcReceiveAddress: params.funding.btcReceiveAddress || undefined,
    },
    note: params.note?.trim() || undefined,
  };
  return JSON.stringify(envelope);
}

export function mergeFundingAdminNote(
  existing: string | null | undefined,
  nextNote: string | null | undefined
): string | null {
  const parsed = parseFundingFromAdminNote(existing);
  const note = nextNote?.trim() ? nextNote.trim() : parsed.note;
  if (!parsed.funding.wire.configured && !parsed.funding.btcReceiveAddress && !note) {
    return null;
  }
  return encodeFundingAdminNote({ funding: parsed.funding, note });
}

export function validateWealthWireInput(input: {
  bankName?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  routing?: string;
  beneficiary?: string;
  beneficiaryAddress?: string;
}): { ok: true; funding: EntryFunding } | { ok: false; error: string } {
  const checked = validateEscrowInput(input);
  if (!checked.ok) return checked;
  return {
    ok: true,
    funding: {
      wire: wireFromPartial({
        bankName: checked.data.escrowBankName,
        bankAddress: checked.data.escrowBankAddress || "",
        accountName: checked.data.escrowAccountName,
        accountNumber: checked.data.escrowAccountNumber || "",
        iban: checked.data.escrowIban || "",
        swift: checked.data.escrowSwift,
        routing: checked.data.escrowRouting || "",
        beneficiary: checked.data.escrowBeneficiary || "",
        beneficiaryAddress: checked.data.escrowBeneficiaryAddress || "",
      }),
      btcReceiveAddress: "",
    },
  };
}

export function validateWealthBtcInput(
  address: string | null | undefined
): { ok: true; funding: EntryFunding } | { ok: false; error: string } {
  const btcReceiveAddress = String(address || "").trim();
  if (btcReceiveAddress.length < 20) {
    return { ok: false, error: "Bitcoin receive address is required" };
  }
  return {
    ok: true,
    funding: { wire: emptyWireInstructions(), btcReceiveAddress },
  };
}

export function paymentProofForEntry(
  proofs: PaymentProof[],
  entryId: string
): PaymentProof | undefined {
  return proofs.find(
    (doc) => doc.filePath.includes("wealth-funding") && doc.filePath.includes(entryId)
  );
}

export function pendingInterestUsd(params: {
  principalUsd: number;
  annualYieldPct: number;
  lastAccruedAt: Date;
  status: string;
  now?: Date;
}): number {
  const now = params.now ?? new Date();
  if (
    params.status !== MANDATE_STATUS.ACTIVE ||
    params.principalUsd <= 0 ||
    params.annualYieldPct <= 0
  ) {
    return 0;
  }
  const elapsedMs = now.getTime() - params.lastAccruedAt.getTime();
  if (elapsedMs <= 0) return 0;
  const days = elapsedMs / (365 * 24 * 60 * 60 * 1000);
  return roundUsd(params.principalUsd * (params.annualYieldPct / 100) * days);
}

export function bookedPrincipalUsd(entries: LedgerLike[]): number {
  let principal = 0;
  for (const entry of entries) {
    if (entry.type === WEALTH_ENTRY.DEPOSIT_WIRE || entry.type === WEALTH_ENTRY.DEPOSIT_BTC) {
      if (entry.status === WEALTH_STATUS.CONFIRMED) principal += entry.amountUsd;
    } else if (
      entry.type === WEALTH_ENTRY.ADJUSTMENT ||
      entry.type === WEALTH_ENTRY.FOUNDING_BONUS
    ) {
      if (entry.status === WEALTH_STATUS.CONFIRMED) principal += entry.amountUsd;
    } else if (entry.type === WEALTH_ENTRY.INTEREST_REINVEST) {
      if (entry.status === WEALTH_STATUS.CONFIRMED) principal += entry.amountUsd;
    }
  }
  return roundUsd(principal);
}

export function bookedAccruedUsd(entries: LedgerLike[]): number {
  let accrued = 0;
  for (const entry of entries) {
    if (entry.type === WEALTH_ENTRY.INTEREST_ACCRUAL && entry.status === WEALTH_STATUS.CONFIRMED) {
      accrued += entry.amountUsd;
    } else if (entry.type === WEALTH_ENTRY.INTEREST_REINVEST && entry.status === WEALTH_STATUS.CONFIRMED) {
      accrued -= entry.amountUsd;
    } else if (
      entry.type === WEALTH_ENTRY.INTEREST_WITHDRAW &&
      (entry.status === WEALTH_STATUS.PENDING || entry.status === WEALTH_STATUS.PAID)
    ) {
      accrued -= entry.amountUsd;
    }
  }
  return roundUsd(accrued);
}

export function deriveBalances(
  entries: LedgerLike[],
  mandate: { annualYieldPct: number; lastAccruedAt: Date; status: string },
  now = new Date()
) {
  const principalUsd = bookedPrincipalUsd(entries);
  const pendingUsd = pendingInterestUsd({
    principalUsd,
    annualYieldPct: mandate.annualYieldPct,
    lastAccruedAt: mandate.lastAccruedAt,
    status: mandate.status,
    now,
  });
  const accruedInterestUsd = roundUsd(Math.max(0, bookedAccruedUsd(entries) + pendingUsd));
  return {
    principalUsd,
    pendingInterestUsd: pendingUsd,
    accruedInterestUsd,
    totalValueUsd: roundUsd(principalUsd + accruedInterestUsd),
    asOf: now.toISOString(),
  };
}

export function newFundingReference(mandateId: string): string {
  const tail = mandateId.slice(-6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SBDV-W-${tail}-${rand}`;
}

export async function ensureWealthMandate(clientProfileId: string) {
  const existing = await prisma.wealthMandate.findUnique({
    where: { clientProfileId },
  });
  if (existing) return existing;
  return prisma.wealthMandate.create({
    data: {
      clientProfileId,
      annualYieldPct: defaultYieldPct(),
      status: MANDATE_STATUS.ACTIVE,
      lastAccruedAt: new Date(),
    },
  });
}

export async function seedDemoWealthMandate(clientProfileId: string) {
  const opened = new Date();
  opened.setUTCDate(opened.getUTCDate() - 30);

  let mandate = await prisma.wealthMandate.findUnique({
    where: { clientProfileId },
    include: { entries: true },
  });
  if (!mandate) {
    mandate = await prisma.wealthMandate.create({
      data: {
        clientProfileId,
        annualYieldPct: defaultYieldPct(),
        status: MANDATE_STATUS.ACTIVE,
        lastAccruedAt: opened,
      },
      include: { entries: true },
    });
  }

  const funded = mandate.entries.some(
    (entry: { type: string; status: string }) =>
      (entry.type === WEALTH_ENTRY.DEPOSIT_WIRE || entry.type === WEALTH_ENTRY.DEPOSIT_BTC) &&
      entry.status === WEALTH_STATUS.CONFIRMED
  );
  if (!funded) {
    await prisma.wealthLedgerEntry.create({
      data: {
        mandateId: mandate.id,
        type: WEALTH_ENTRY.DEPOSIT_WIRE,
        status: WEALTH_STATUS.CONFIRMED,
        amountUsd: 250000,
        paymentReference: "SBDV-W-SEED-001",
        clientNote: "Seeded opening principal",
        confirmedAt: opened,
        createdAt: opened,
      },
    });
    await prisma.wealthMandate.update({
      where: { id: mandate.id },
      data: { lastAccruedAt: opened },
    });
  }

  return prisma.wealthMandate.findUnique({
    where: { id: mandate.id },
    include: { entries: true },
  });
}

export async function flushPendingInterest(mandateId: string, now = new Date()) {
  const mandate = await prisma.wealthMandate.findUnique({
    where: { id: mandateId },
    include: { entries: true },
  });
  if (!mandate) return null;

  const principalUsd = bookedPrincipalUsd(mandate.entries);
  const pendingUsd = pendingInterestUsd({
    principalUsd,
    annualYieldPct: mandate.annualYieldPct,
    lastAccruedAt: mandate.lastAccruedAt,
    status: mandate.status,
    now,
  });

  if (pendingUsd < 0.01) {
    if (mandate.lastAccruedAt.getTime() !== now.getTime()) {
      await prisma.wealthMandate.update({
        where: { id: mandateId },
        data: { lastAccruedAt: now },
      });
    }
    return prisma.wealthMandate.findUnique({
      where: { id: mandateId },
      include: { entries: true },
    });
  }

  await prisma.$transaction([
    prisma.wealthLedgerEntry.create({
      data: {
        mandateId,
        type: WEALTH_ENTRY.INTEREST_ACCRUAL,
        status: WEALTH_STATUS.CONFIRMED,
        amountUsd: pendingUsd,
        confirmedAt: now,
      },
    }),
    prisma.wealthMandate.update({
      where: { id: mandateId },
      data: { lastAccruedAt: now },
    }),
  ]);

  return prisma.wealthMandate.findUnique({
    where: { id: mandateId },
    include: { entries: true },
  });
}

export function serializeMandate(
  mandate: {
    id: string;
    annualYieldPct: number;
    status: string;
    lastAccruedAt: Date;
    reportingCurrency: string;
    createdAt: Date;
    entries: Array<{
      id: string;
      type: string;
      status: string;
      amountUsd: number;
      btcAmount: number | null;
      btcTxid: string | null;
      usdPerBtc: number | null;
      clientNote: string | null;
      adminNote: string | null;
      payoutMethod: string | null;
      payoutBankName: string | null;
      payoutIban: string | null;
      payoutSwift: string | null;
      payoutAccountName: string | null;
      payoutBtcAddress: string | null;
      paymentReference: string | null;
      confirmedAt: Date | null;
      createdAt: Date;
    }>;
  },
  now = new Date(),
  proofs: PaymentProof[] = []
) {
  const balances = deriveBalances(mandate.entries, mandate, now);
  const growth = growthSeries(mandate.entries, balances);
  return {
    id: mandate.id,
    annualYieldPct: mandate.annualYieldPct,
    status: mandate.status,
    lastAccruedAt: mandate.lastAccruedAt.toISOString(),
    reportingCurrency: mandate.reportingCurrency,
    openedAt: mandate.createdAt.toISOString(),
    ...balances,
    entries: [...mandate.entries]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((entry) => {
        const parsed = parseFundingFromAdminNote(entry.adminNote);
        const released = instructionsReleased(entry);
        return {
          id: entry.id,
          type: entry.type,
          status: entry.status,
          amountUsd: entry.amountUsd,
          btcAmount: entry.btcAmount,
          btcTxid: entry.btcTxid,
          usdPerBtc: entry.usdPerBtc,
          clientNote: entry.clientNote,
          adminNote: parsed.note,
          payoutMethod: entry.payoutMethod,
          payoutBankName: entry.payoutBankName,
          payoutIban: entry.payoutIban,
          payoutSwift: entry.payoutSwift,
          payoutAccountName: entry.payoutAccountName,
          payoutBtcAddress: entry.payoutBtcAddress,
          paymentReference: entry.paymentReference,
          confirmedAt: entry.confirmedAt?.toISOString() ?? null,
          createdAt: entry.createdAt.toISOString(),
          paymentProof: (() => {
            const proof = paymentProofForEntry(proofs, entry.id);
            return proof ? { id: proof.id, name: proof.name } : null;
          })(),
          funding: released ? parsed.funding : emptyFundingInstructions(),
        };
      }),
    growth,
    funding: emptyFundingInstructions(),
  };
}

export async function loadPaymentProofs(clientProfileId: string): Promise<PaymentProof[]> {
  return prisma.document.findMany({
    where: { clientProfileId, type: WEALTH_PAYMENT_DOC_TYPE },
    select: { id: true, name: true, filePath: true },
  });
}

export async function loadPaymentProofsForProfiles(
  clientProfileIds: string[]
): Promise<Map<string, PaymentProof[]>> {
  const map = new Map<string, PaymentProof[]>();
  if (!clientProfileIds.length) return map;
  const docs = await prisma.document.findMany({
    where: { clientProfileId: { in: clientProfileIds }, type: WEALTH_PAYMENT_DOC_TYPE },
    select: { id: true, name: true, filePath: true, clientProfileId: true },
  });
  for (const doc of docs) {
    const list = map.get(doc.clientProfileId) || [];
    list.push({ id: doc.id, name: doc.name, filePath: doc.filePath });
    map.set(doc.clientProfileId, list);
  }
  return map;
}

export async function serializeMandateWithProofs(
  mandate: Parameters<typeof serializeMandate>[0] & { clientProfileId: string },
  now = new Date()
) {
  const proofs = await loadPaymentProofs(mandate.clientProfileId);
  return serializeMandate(mandate, now, proofs);
}

function growthSeries(
  entries: Array<{ type: string; status: string; amountUsd: number; createdAt: Date }>,
  live: { principalUsd: number; totalValueUsd: number; asOf: string }
) {
  const chronological = [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  let principal = 0;
  let accrued = 0;
  const points: Array<{ at: string; principalUsd: number; totalUsd: number }> = [];

  for (const entry of chronological) {
    if (entry.type === WEALTH_ENTRY.DEPOSIT_WIRE || entry.type === WEALTH_ENTRY.DEPOSIT_BTC) {
      if (entry.status !== WEALTH_STATUS.CONFIRMED) continue;
      principal = roundUsd(principal + entry.amountUsd);
    } else if (
      (entry.type === WEALTH_ENTRY.ADJUSTMENT || entry.type === WEALTH_ENTRY.FOUNDING_BONUS) &&
      entry.status === WEALTH_STATUS.CONFIRMED
    ) {
      principal = roundUsd(principal + entry.amountUsd);
    } else if (entry.type === WEALTH_ENTRY.INTEREST_ACCRUAL && entry.status === WEALTH_STATUS.CONFIRMED) {
      accrued = roundUsd(accrued + entry.amountUsd);
    } else if (entry.type === WEALTH_ENTRY.INTEREST_REINVEST && entry.status === WEALTH_STATUS.CONFIRMED) {
      accrued = roundUsd(accrued - entry.amountUsd);
      principal = roundUsd(principal + entry.amountUsd);
    } else if (entry.type === WEALTH_ENTRY.INTEREST_WITHDRAW && entry.status === WEALTH_STATUS.PAID) {
      accrued = roundUsd(accrued - entry.amountUsd);
    } else {
      continue;
    }
    points.push({
      at: entry.createdAt.toISOString(),
      principalUsd: principal,
      totalUsd: roundUsd(principal + Math.max(0, accrued)),
    });
  }

  points.push({
    at: live.asOf,
    principalUsd: live.principalUsd,
    totalUsd: live.totalValueUsd,
  });
  return points;
}

export async function loadMandateForProfile(clientProfileId: string) {
  await ensureWealthMandate(clientProfileId);
  return prisma.wealthMandate.findUnique({
    where: { clientProfileId },
    include: { entries: true },
  });
}
