export const ONBOARDING_PHASES = [
  "AWAITING_DOCUMENTS",
  "DOCUMENTS_REVISION",
  "DOCUMENTS_SUBMITTED",
  "AWAITING_DEPOSIT",
  "KYC_REVIEW",
  "AWAITING_BANK_DETAILS",
  "READY_FOR_DISBURSEMENT",
  "DISBURSED",
  "ACTIVE",
] as const;

export type OnboardingPhase = (typeof ONBOARDING_PHASES)[number];

/** Phases where the borrower may upload / replace required docs (pre-approval). */
export const DOCUMENT_UPLOAD_PHASES: OnboardingPhase[] = [
  "AWAITING_DOCUMENTS",
  "DOCUMENTS_REVISION",
];

export const REQUIRED_DOCUMENT_TYPES = [
  "AUDITED_FINANCIALS",
  "FACILITY_AGREEMENT",
  "KYC_DISCLOSURE",
  "DEPLOYMENT_PLAN",
  "GOVERNMENT_ID",
] as const;

export type RequiredDocumentType = (typeof REQUIRED_DOCUMENT_TYPES)[number];

export const PAYMENT_SLIP_TYPE = "PAYMENT_SLIP" as const;

export interface EscrowFields {
  escrowBankName?: string | null;
  escrowBankAddress?: string | null;
  escrowAccountName?: string | null;
  escrowAccountNumber?: string | null;
  escrowIban?: string | null;
  escrowSwift?: string | null;
  escrowBeneficiary?: string | null;
  escrowBeneficiaryAddress?: string | null;
  escrowPaymentRef?: string | null;
}

export interface EscrowInstructions {
  bankName: string;
  bankAddress: string | null;
  accountName: string;
  accountNumber: string | null;
  iban: string;
  swift: string;
  reference: string;
  beneficiary: string;
  beneficiaryAddress: string | null;
  configured: boolean;
}

export interface DisburseBankFields {
  disburseBankName?: string | null;
  disburseBankAddress?: string | null;
  disburseAccountName?: string | null;
  disburseAccountNumber?: string | null;
  disburseIban?: string | null;
  disburseSwift?: string | null;
  disburseBeneficiary?: string | null;
  disburseBeneficiaryAddress?: string | null;
  bankDetailsSubmittedAt?: DateTimeLike | null;
}

type DateTimeLike = Date | string;

export function getEscrowInstructions(
  applicationId: string,
  companyName: string,
  stored?: EscrowFields | null
): EscrowInstructions {
  const fallbackRef = `CAP-${applicationId.slice(-8).toUpperCase()}`;
  const bankName = stored?.escrowBankName?.trim() || "";
  const bankAddress = stored?.escrowBankAddress?.trim() || null;
  const accountName = stored?.escrowAccountName?.trim() || "";
  const accountNumber = stored?.escrowAccountNumber?.trim() || null;
  const iban = stored?.escrowIban?.trim() || "";
  const swift = stored?.escrowSwift?.trim() || "";
  const beneficiary = stored?.escrowBeneficiary?.trim() || companyName;
  const beneficiaryAddress = stored?.escrowBeneficiaryAddress?.trim() || null;
  const reference = stored?.escrowPaymentRef?.trim() || fallbackRef;
  const configured = Boolean(bankName && accountName && iban && swift);

  return {
    bankName: bankName || "Pending assignment",
    bankAddress,
    accountName: accountName || "Pending assignment",
    accountNumber,
    iban: iban || "—",
    swift: swift || "—",
    reference,
    beneficiary,
    beneficiaryAddress,
    configured,
  };
}

export function validateEscrowInput(input: {
  bankName?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  beneficiary?: string;
  beneficiaryAddress?: string;
  paymentReference?: string;
}) {
  const bankName = input.bankName?.trim() || "";
  const bankAddress = input.bankAddress?.trim() || "";
  const accountName = input.accountName?.trim() || "";
  const accountNumber = input.accountNumber?.trim() || "";
  const iban = input.iban?.trim() || "";
  const swift = input.swift?.trim() || "";
  const beneficiary = input.beneficiary?.trim() || "";
  const beneficiaryAddress = input.beneficiaryAddress?.trim() || "";
  const paymentReference = input.paymentReference?.trim() || "";

  if (!bankName || !accountName || !iban || !swift) {
    return { ok: false as const, error: "Bank name, account name, IBAN, and SWIFT are required" };
  }

  return {
    ok: true as const,
    data: {
      escrowBankName: bankName,
      escrowBankAddress: bankAddress || null,
      escrowAccountName: accountName,
      escrowAccountNumber: accountNumber || null,
      escrowIban: iban,
      escrowSwift: swift,
      escrowBeneficiary: beneficiary || null,
      escrowBeneficiaryAddress: beneficiaryAddress || null,
      escrowPaymentRef: paymentReference || null,
    },
  };
}

export function validateDisburseBankInput(input: {
  bankName?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  beneficiary?: string;
  beneficiaryAddress?: string;
}) {
  const bankName = input.bankName?.trim() || "";
  const bankAddress = input.bankAddress?.trim() || "";
  const accountName = input.accountName?.trim() || "";
  const accountNumber = input.accountNumber?.trim() || "";
  const iban = input.iban?.trim() || "";
  const swift = input.swift?.trim() || "";
  const beneficiary = input.beneficiary?.trim() || "";
  const beneficiaryAddress = input.beneficiaryAddress?.trim() || "";

  if (!bankName || !accountName || !iban || !swift) {
    return { ok: false as const, error: "Bank name, account name, IBAN, and SWIFT are required" };
  }

  return {
    ok: true as const,
    data: {
      disburseBankName: bankName,
      disburseBankAddress: bankAddress || null,
      disburseAccountName: accountName,
      disburseAccountNumber: accountNumber || null,
      disburseIban: iban,
      disburseSwift: swift,
      disburseBeneficiary: beneficiary || null,
      disburseBeneficiaryAddress: beneficiaryAddress || null,
    },
  };
}

export function hasDisburseBankDetails(stored?: DisburseBankFields | null): boolean {
  if (!stored) return false;
  return Boolean(
    stored.disburseBankName?.trim() &&
      stored.disburseAccountName?.trim() &&
      stored.disburseIban?.trim() &&
      stored.disburseSwift?.trim() &&
      stored.bankDetailsSubmittedAt
  );
}

export function getPhaseIndex(phase: string | null | undefined): number {
  if (!phase) return -1;
  return ONBOARDING_PHASES.indexOf(phase as OnboardingPhase);
}

export function hasRequiredDocuments(uploadedTypes: string[]): boolean {
  return REQUIRED_DOCUMENT_TYPES.every((t) => uploadedTypes.includes(t));
}

export function hasPaymentSlip(uploadedTypes: string[]): boolean {
  return uploadedTypes.includes(PAYMENT_SLIP_TYPE);
}

export function canBorrowerUploadDocuments(
  status: string,
  phase: string | null | undefined
): boolean {
  if (!phase || !DOCUMENT_UPLOAD_PHASES.includes(phase as OnboardingPhase)) return false;
  return status === "PENDING" || status === "UNDER_REVIEW" || status === "APPROVED";
}

/**
 * Next phase after admin advance (post-approval path).
 * Docs are collected before approval; after deposit we go to KYC;
 * after KYC the borrower submits disbursement bank details.
 */
export function getNextAdminAction(phase: string | null | undefined): OnboardingPhase | null {
  switch (phase) {
    case "AWAITING_DEPOSIT":
      return "KYC_REVIEW";
    case "AWAITING_DOCUMENTS":
      // Legacy post-deposit docs stage only (new apps leave this phase via approval)
      return "KYC_REVIEW";
    case "KYC_REVIEW":
      return "AWAITING_BANK_DETAILS";
    case "AWAITING_BANK_DETAILS":
      return "READY_FOR_DISBURSEMENT";
    case "READY_FOR_DISBURSEMENT":
      return "DISBURSED";
    case "DISBURSED":
      return "ACTIVE";
    default:
      return null;
  }
}

export function getPhaseLabelKey(phase: string): string {
  return `capitalAccess.onboarding.phases.${phase.toLowerCase()}`;
}
