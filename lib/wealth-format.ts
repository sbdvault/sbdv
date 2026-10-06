/** Format USD billions/trillions for admin display */
export function formatDisclosedAum(amountBillions: number): string {
  if (amountBillions >= 1000) {
    const trillions = amountBillions / 1000;
    return `$${trillions.toFixed(2)}T`;
  }
  if (amountBillions >= 1) {
    return `$${amountBillions.toFixed(1)}B`;
  }
  return `$${(amountBillions * 1000).toFixed(0)}M`;
}

export function computeDisclosedRange(
  aumMinUsd: number,
  aumMaxUsd: number,
  displayFraction: number
) {
  const min = aumMinUsd * displayFraction;
  const max = aumMaxUsd * displayFraction;
  const midpoint = (min + max) / 2;
  return {
    disclosedMin: min,
    disclosedMax: max,
    disclosedMid: midpoint,
    disclosedLabel:
      min === max
        ? formatDisclosedAum(min)
        : `${formatDisclosedAum(min)} – ${formatDisclosedAum(max)}`,
    fractionPct: Math.round(displayFraction * 100),
  };
}

export function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    Norway: "🇳🇴",
    China: "🇨🇳",
    "United Arab Emirates": "🇦🇪",
    Kuwait: "🇰🇼",
    Singapore: "🇸🇬",
    Indonesia: "🇮🇩",
    "Saudi Arabia": "🇸🇦",
    Qatar: "🇶🇦",
    Australia: "🇦🇺",
    Bahrain: "🇧🇭",
    Oman: "🇴🇲",
    Morocco: "🇲🇦",
    "United States": "🇺🇸",
    Spain: "🇪🇸",
    Brunei: "🇧🇳",
    Thailand: "🇹🇭",
    Monaco: "🇲🇨",
    Liechtenstein: "🇱🇮",
    Jordan: "🇯🇴",
    Denmark: "🇩🇰",
    "United Kingdom": "🇬🇧",
  };
  return flags[country] ?? "🌍";
}

export const categoryLabels: Record<string, string> = {
  SOVEREIGN: "Sovereign Wealth Fund",
  MONARCHY: "Monarchy / Royal Office",
  FAMILY: "Family Office",
  INDIVIDUAL: "Individual UHNW",
};
