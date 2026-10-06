import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeDisclosedRange, categoryLabels } from "@/lib/wealth-format";
import { NextResponse } from "next/server";

function mapEntityWithAllocation(
  entity: {
    id: string;
    category: string;
    country: string;
    region: string | null;
    name: string;
    vehicleName: string | null;
    aumMinUsd: number;
    aumMaxUsd: number;
    displayFraction: number;
    mandate: string;
  },
  allocatedUsdM: number
) {
  const disclosed = computeDisclosedRange(
    entity.aumMinUsd,
    entity.aumMaxUsd,
    entity.displayFraction
  );
  const disclosedMaxUsdM = disclosed.disclosedMax * 1000;
  const availableUsdM = Math.max(0, disclosedMaxUsdM - allocatedUsdM);

  return {
    id: entity.id,
    country: entity.country,
    region: entity.region,
    name: entity.name,
    vehicleName: entity.vehicleName,
    mandate: entity.mandate,
    category: entity.category,
    disclosedAum: disclosed.disclosedLabel,
    disclosedMid: disclosed.disclosedMid,
    disclosedMax: disclosed.disclosedMax,
    fractionPct: disclosed.fractionPct,
    categoryLabel: categoryLabels[entity.category] ?? entity.category,
    allocatedUsdM,
    availableUsdM,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entities = await prisma.globalWealthEntity.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const directives = await prisma.wealthInvestmentDirective.findMany({
    where: { status: { in: ["PENDING", "ACTIVE", "EXECUTED"] } },
    select: { entityId: true, amountUsdM: true },
  });

  const allocatedByEntity = directives.reduce<Record<string, number>>((acc, d) => {
    acc[d.entityId] = (acc[d.entityId] || 0) + d.amountUsdM;
    return acc;
  }, {});

  const sovereign = entities
    .filter((e) => e.category === "SOVEREIGN")
    .map((e) => mapEntityWithAllocation(e, allocatedByEntity[e.id] || 0))
    .sort((a, b) => b.disclosedMid - a.disclosedMid);

  const privateWealth = entities
    .filter((e) => e.category !== "SOVEREIGN")
    .map((e) => mapEntityWithAllocation(e, allocatedByEntity[e.id] || 0))
    .sort((a, b) => b.disclosedMid - a.disclosedMid);

  const byCountry = sovereign.reduce<Record<string, typeof sovereign>>((acc, item) => {
    if (!acc[item.country]) acc[item.country] = [];
    acc[item.country].push(item);
    return acc;
  }, {});

  const sovereignCountries = Object.keys(byCountry).sort((a, b) => {
    const aTotal = byCountry[a].reduce((s, x) => s + x.disclosedMid, 0);
    const bTotal = byCountry[b].reduce((s, x) => s + x.disclosedMid, 0);
    return bTotal - aTotal;
  });

  return NextResponse.json({
    sovereign,
    sovereignByCountry: byCountry,
    sovereignCountries,
    privateWealth,
    totals: {
      sovereignCount: sovereign.length,
      privateCount: privateWealth.length,
      disclosedSovereignMid: sovereign.reduce((s, x) => s + x.disclosedMid, 0),
      disclosedPrivateMid: privateWealth.reduce((s, x) => s + x.disclosedMid, 0),
    },
  });
}
