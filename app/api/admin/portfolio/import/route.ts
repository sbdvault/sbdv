import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin endpoint to import portfolio holdings from custodian/PMS data.
 * Phase 3: replace with automated custodian API integration.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, holdings, performance } = await request.json();

  if (!userId || !holdings?.length) {
    return NextResponse.json({ error: "userId and holdings required" }, { status: 400 });
  }

  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
  }

  let portfolio = await prisma.portfolio.findFirst({
    where: { clientProfileId: profile.id },
  });

  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: { clientProfileId: profile.id, name: "Primary Portfolio" },
    });
  }

  await prisma.holding.deleteMany({ where: { portfolioId: portfolio.id } });

  await prisma.holding.createMany({
    data: holdings.map((h: {
      type: string;
      name: string;
      symbol?: string;
      quantity: number;
      unit?: string;
      costBasis: number;
      marketValue: number;
      purity?: string;
      vaultLocation?: string;
      auditStatus?: string;
    }) => ({
      portfolioId: portfolio!.id,
      type: h.type,
      name: h.name,
      symbol: h.symbol,
      quantity: h.quantity,
      unit: h.unit,
      costBasis: h.costBasis,
      marketValue: h.marketValue,
      purity: h.purity,
      vaultLocation: h.vaultLocation,
      auditStatus: h.auditStatus || "verified",
    })),
  });

  if (performance?.length) {
    await prisma.performanceRecord.deleteMany({ where: { portfolioId: portfolio.id } });
    await prisma.performanceRecord.createMany({
      data: performance.map((p: { period: string; returnPct: number; benchmarkPct?: number }) => ({
        portfolioId: portfolio!.id,
        period: p.period,
        returnPct: p.returnPct,
        benchmarkPct: p.benchmarkPct,
      })),
    });
  }

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { asOfDate: new Date() },
  });

  await prisma.auditEvent.create({
    data: {
      userId: session.user.id,
      action: "PORTFOLIO_IMPORT",
      details: `Imported ${holdings.length} holdings for user ${userId}`,
    },
  });

  return NextResponse.json({ success: true, portfolioId: portfolio.id });
}
