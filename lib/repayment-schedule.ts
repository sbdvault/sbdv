export type InstallmentPayment = {
  installment: number;
  amountUsd: number;
  status: "SUBMITTED" | "PAID";
  submittedAt: string;
  paidAt: string | null;
  reference: string;
  documentId?: string | null;
};

export type InstallmentStatus = "PAID" | "SUBMITTED" | "DUE" | "UPCOMING";

export type ScheduleRow = {
  installment: number;
  ordinal: string;
  dueAt: string;
  amountUsd: number;
  principalUsd: number;
  interestUsd: number;
  status: InstallmentStatus;
  paidAt: string | null;
  submittedAt: string | null;
  reference: string | null;
};

export function parseInstallmentPayments(value: unknown): InstallmentPayment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as {
      installment?: unknown;
      paidAt?: unknown;
      amountUsd?: unknown;
      status?: unknown;
      submittedAt?: unknown;
      reference?: unknown;
      documentId?: unknown;
    };
    const installment = Number(row.installment);
    const amountUsd = Number(row.amountUsd);
    if (!Number.isFinite(installment) || installment < 1) return [];

    const paidAt = typeof row.paidAt === "string" ? row.paidAt : null;
    const submittedAt = typeof row.submittedAt === "string" ? row.submittedAt : paidAt;
    if (!submittedAt && !paidAt) return [];

    const status: InstallmentPayment["status"] =
      row.status === "SUBMITTED" || !paidAt ? "SUBMITTED" : "PAID";

    return [
      {
        installment,
        amountUsd: Number.isFinite(amountUsd) ? amountUsd : 0,
        status,
        submittedAt: submittedAt || paidAt || new Date().toISOString(),
        paidAt,
        reference: typeof row.reference === "string" ? row.reference : "",
        documentId: typeof row.documentId === "string" ? row.documentId : null,
      },
    ];
  });
}

export function installmentOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function addPeriod(start: Date, periods: number, frequency: string): Date {
  const due = new Date(start);
  if (frequency === "MONTHLY") due.setMonth(due.getMonth() + periods);
  else due.setFullYear(due.getFullYear() + periods);
  return due;
}

export function buildRepaymentSchedule(input: {
  disbursedAt: string | Date;
  termYears: number;
  repaymentFrequency: string;
  principalUsd: number;
  installmentUsd: number;
  payments?: unknown;
  now?: Date;
}): ScheduleRow[] {
  const start = new Date(input.disbursedAt);
  if (Number.isNaN(start.getTime())) return [];

  const periods =
    input.repaymentFrequency === "MONTHLY" ? Math.max(1, input.termYears * 12) : Math.max(1, input.termYears);
  const principalEach = input.principalUsd / periods;
  const interestEach = input.installmentUsd - principalEach;
  const paid = new Map(parseInstallmentPayments(input.payments).map((p) => [p.installment, p]));
  const now = input.now ?? new Date();

  return Array.from({ length: periods }, (_, index) => {
    const installment = index + 1;
    const due = addPeriod(start, installment, input.repaymentFrequency);
    const payment = paid.get(installment);
    const status: InstallmentStatus = payment
      ? payment.status === "SUBMITTED"
        ? "SUBMITTED"
        : "PAID"
      : due.getTime() <= now.getTime()
        ? "DUE"
        : "UPCOMING";

    return {
      installment,
      ordinal: installmentOrdinal(installment),
      dueAt: due.toISOString(),
      amountUsd: input.installmentUsd,
      principalUsd: principalEach,
      interestUsd: interestEach,
      status,
      paidAt: payment?.paidAt ?? null,
      submittedAt: payment?.status === "SUBMITTED" ? payment.submittedAt : null,
      reference: payment?.reference || null,
    };
  });
}

export function nextUnpaidInstallment(rows: ScheduleRow[]): ScheduleRow | null {
  return rows.find((row) => row.status !== "PAID") ?? null;
}

export function repaymentReference(applicationId: string, installment: number): string {
  return `REP-${applicationId.slice(-8).toUpperCase()}-${String(installment).padStart(2, "0")}`;
}
