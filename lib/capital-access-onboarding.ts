export const ONBOARDING_PHASES = [
  "AWAITING_DEPOSIT",
  "AWAITING_DOCUMENTS",
  "KYC_REVIEW",
  "READY_FOR_DISBURSEMENT",
  "DISBURSED",
  "ACTIVE",
] as const;

export type OnboardingPhase = (typeof ONBOARDING_PHASES)[number];

export const REQUIRED_DOCUMENT_TYPES = [
  "AUDITED_FINANCIALS",
  "FACILITY_AGREEMENT",
  "KYC_DISCLOSURE",
  "DEPLOYMENT_PLAN",
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

export function getNextAdminAction(phase: string | null | undefined): OnboardingPhase | null {
  switch (phase) {
    case "AWAITING_DEPOSIT":
      return "AWAITING_DOCUMENTS";
    case "AWAITING_DOCUMENTS":
      return "KYC_REVIEW";
    case "KYC_REVIEW":
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
