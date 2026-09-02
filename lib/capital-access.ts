/** Capital Access Program — institutional lending terms & pool teasers */

export const SECURITY_DEPOSIT_PCT = 10;
export const MIN_REQUEST_USD = 500_000;
export const MAX_REQUEST_USD = 100_000_000;
export const MIN_TERM_YEARS = 1;
export const MAX_TERM_YEARS = 10;

export type RepaymentFrequency = "MONTHLY" | "YEARLY";

export interface CapitalTerms {
  interestRatePct: number;
  securityDepositPct: number;
  securityDepositUsd: number;
  totalInterestUsd: number;
  totalRepaymentUsd: number;
  installmentUsd: number;
  periods: number;
  repaymentFrequency: RepaymentFrequency;
}

export function calculateInterestRate(requestedUsd: number, termYears: number): number {
  let rate = 7.25;
  if (requestedUsd >= 5_000_000) rate -= 0.25;
  if (requestedUsd >= 10_000_000) rate -= 0.5;
  if (requestedUsd >= 25_000_000) rate -= 0.5;
  if (termYears <= 2) rate += 0.75;
  if (termYears >= 7) rate -= 0.25;
  return Math.round(rate * 100) / 100;
}

export function calculateCapitalTerms(
  requestedUsd: number,
  termYears: number,
  repaymentFrequency: RepaymentFrequency
): CapitalTerms {
  const interestRatePct = calculateInterestRate(requestedUsd, termYears);
  const securityDepositUsd = requestedUsd * (SECURITY_DEPOSIT_PCT / 100);
  const totalInterestUsd = requestedUsd * (interestRatePct / 100) * termYears;
  const totalRepaymentUsd = requestedUsd + totalInterestUsd;
  const periods = repaymentFrequency === "MONTHLY" ? termYears * 12 : termYears;
  const installmentUsd = totalRepaymentUsd / periods;

  return {
    interestRatePct,
    securityDepositPct: SECURITY_DEPOSIT_PCT,
    securityDepositUsd,
    totalInterestUsd,
    totalRepaymentUsd,
    installmentUsd,
    periods,
    repaymentFrequency,
  };
}

export function formatUsdCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

/** Public-facing pool labels — entity identity partially redacted */
export const poolTeaserLabels: Record<string, { label: string; focus: string }> = {
  Norway: { label: "Nordic Intergenerational Pool", focus: "Global equities & ESG infrastructure" },
  China: { label: "Asia-Pacific Reserve Allocation", focus: "Diversified state reserve deployment" },
  "United Arab Emirates": { label: "Gulf Sovereign Growth Fund", focus: "Multi-asset global mandate" },
  Kuwait: { label: "Gulf Future Generations Pool", focus: "Long-horizon sovereign reserves" },
  Singapore: { label: "Southeast Asia Fiscal Reserve", focus: "FX reserves & strategic holdings" },
  Indonesia: { label: "Emerging Market Consolidation Pool", focus: "State enterprise expansion" },
  "Saudi Arabia": { label: "Vision Transformation Fund", focus: "Economic diversification program" },
  Qatar: { label: "Gulf LNG Infrastructure Pool", focus: "Global infrastructure & real assets" },
  Australia: { label: "Pacific Future Fund", focus: "Private equity & alternatives" },
  Bahrain: { label: "Gulf Diversification Pool", focus: "Regional growth capital" },
  Oman: { label: "Sultanate Investment Pool", focus: "Sovereign wealth diversification" },
  Morocco: { label: "North Africa Strategic Pool", focus: "Regional development finance" },
};

export function getPoolTeaser(country: string, category: string) {
  const sovereign = poolTeaserLabels[country];
  if (sovereign) return sovereign;
  if (category === "MONARCHY") {
    return { label: "Royal Family Investment Office", focus: "Private global conglomerate capital" };
  }
  if (category === "FAMILY") {
    return { label: "UHNW Family Office Pool", focus: "Generational wealth deployment" };
  }
  return { label: "Institutional Private Capital Pool", focus: "Strategic enterprise investment" };
}

export const accessConditions = [
  "minimumOperatingYears",
  "auditedFinancials",
  "securityDeposit",
  "kycAml",
  "mandateAlignment",
  "minimumTicket",
] as const;
