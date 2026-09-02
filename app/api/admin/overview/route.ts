import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeDisclosedRange } from "@/lib/wealth-format";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entities = await prisma.globalWealthEntity.findMany({
    where: { category: "SOVEREIGN" },
  });

  const directives = await prisma.wealthInvestmentDirective.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      entity: { select: { name: true, country: true } },
    },
  });

  const allDirectives = await prisma.wealthInvestmentDirective.findMany({
    where: { status: { in: ["PENDING", "ACTIVE", "EXECUTED"] } },
  });

  const sovereignCount = await prisma.globalWealthEntity.count({
    where: { category: "SOVEREIGN" },
  });
  const privateCount = await prisma.globalWealthEntity.count({
    where: { category: { not: "SOVEREIGN" } },
  });

  const sovereignEntities = await prisma.globalWealthEntity.findMany({
    where: { category: "SOVEREIGN" },
  });
  const privateEntities = await prisma.globalWealthEntity.findMany({
    where: { category: { not: "SOVEREIGN" } },
  });

  const disclosedSovereignMid = sovereignEntities.reduce((s, e) => {
    const d = computeDisclosedRange(e.aumMinUsd, e.aumMaxUsd, e.displayFraction);
    return s + d.disclosedMid;
  }, 0);

  const disclosedPrivateMid = privateEntities.reduce((s, e) => {
    const d = computeDisclosedRange(e.aumMinUsd, e.aumMaxUsd, e.displayFraction);
    return s + d.disclosedMid;
  }, 0);

  const countryTotals = entities.reduce<
    Record<string, { disclosedMid: number; count: number }>
  >((acc, e) => {
    const d = computeDisclosedRange(e.aumMinUsd, e.aumMaxUsd, e.displayFraction);
    if (!acc[e.country]) acc[e.country] = { disclosedMid: 0, count: 0 };
    acc[e.country].disclosedMid += d.disclosedMid;
    acc[e.country].count += 1;
    return acc;
  }, {});

  const topSovereignCountries = Object.entries(countryTotals)
    .map(([country, data]) => ({ country, ...data }))
    .sort((a, b) => b.disclosedMid - a.disclosedMid)
    .slice(0, 6);

  const activeDirectives = allDirectives.filter((d) => d.status === "ACTIVE").length;
  const pendingDirectives = allDirectives.filter((d) => d.status === "PENDING").length;
  const totalAllocatedUsdM = allDirectives.reduce((s, d) => s + d.amountUsdM, 0);

  return NextResponse.json({
    totals: {
      sovereignCount,
      privateCount,
      disclosedSovereignMid,
      disclosedPrivateMid,
      activeDirectives,
      pendingDirectives,
      totalAllocatedUsdM,
    },
    recentDirectives: directives.map((d) => ({
      id: d.id,
      entityName: d.entity.name,
      country: d.entity.country,
      amountUsdM: d.amountUsdM,
      assetClass: d.assetClass,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    })),
    topSovereignCountries,
  });
}
