export type EntryFunding = {
  wire: {
    configured: boolean;
    bankName: string;
    bankAddress: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    swift: string;
    routing?: string;
    beneficiary: string;
    beneficiaryAddress: string;
  };
  btcReceiveAddress: string;
};

export interface MandateSnapshot {
  id: string;
  annualYieldPct: number;
  status: string;
  lastAccruedAt: string;
  reportingCurrency: string;
  openedAt: string;
  principalUsd: number;
  pendingInterestUsd: number;
  accruedInterestUsd: number;
  totalValueUsd: number;
  asOf: string;
  growth: Array<{ at: string; principalUsd: number; totalUsd: number }>;
  funding: EntryFunding;
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
    confirmedAt: string | null;
    createdAt: string;
    paymentProof?: { id: string; name: string } | null;
    funding?: EntryFunding;
  }>;
}

export function formatUsd(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

export function liveAccrued(mandate: MandateSnapshot, nowMs = Date.now()) {
  if (mandate.status !== "ACTIVE") return mandate.accruedInterestUsd;
  const start = new Date(mandate.lastAccruedAt).getTime();
  const days = Math.max(0, (nowMs - start) / (365 * 24 * 60 * 60 * 1000));
  const extra = mandate.principalUsd * (mandate.annualYieldPct / 100) * days;
  const booked = mandate.accruedInterestUsd - mandate.pendingInterestUsd;
  return Math.round((booked + extra) * 100) / 100;
}

export function liveTotal(mandate: MandateSnapshot, nowMs = Date.now()) {
  return Math.round((mandate.principalUsd + liveAccrued(mandate, nowMs)) * 100) / 100;
}
