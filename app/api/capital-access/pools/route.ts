import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getPoolTeaser,
  formatUsdCompact,
  SECURITY_DEPOSIT_PCT,
  MIN_REQUEST_USD,
} from "@/lib/capital-access";
import { computeDisclosedRange } from "@/lib/wealth-format";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entities = await prisma.globalWealthEntity.findMany({
    where: { category: "SOVEREIGN" },
    orderBy: { sortOrder: "asc" },
  });

  const pools = entities.map((e) => {
    const disclosed = computeDisclosedRange(e.aumMinUsd, e.aumMaxUsd, e.displayFraction);
    const teaser = getPoolTeaser(e.country, e.category);
    const availableUsd = disclosed.disclosedMax * 1_000_000_000 * 0.15;

    return {
      id: e.id,
      label: teaser.label,
      focus: teaser.focus,
      region: e.region || e.country,
      countryCode: e.country.slice(0, 2).toUpperCase(),
      availableRange: `${formatUsdCompact(availableUsd * 0.3)} – ${formatUsdCompact(availableUsd)}`,
      minTicket: formatUsdCompact(MIN_REQUEST_USD),
      securityDepositPct: SECURITY_DEPOSIT_PCT,
      mandateHint: e.mandate.slice(0, 120) + (e.mandate.length > 120 ? "…" : ""),
      interestFrom: "6.5%",
    };
  });

  return NextResponse.json({ pools });
}
