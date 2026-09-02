import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getClientProfile(userId: string) {
  return prisma.clientProfile.findUnique({
    where: { userId },
    include: {
      portfolios: {
        include: {
          holdings: true,
          performance: { orderBy: { recordedAt: "desc" } },
        },
      },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getClientProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "No portfolio found" }, { status: 404 });
  }

  const portfolio = profile.portfolios[0];
  if (!portfolio) {
    return NextResponse.json({ error: "No portfolio found" }, { status: 404 });
  }

  const bullionHoldings = portfolio.holdings.filter((h) => h.type === "BULLION");
  const financialHoldings = portfolio.holdings.filter((h) => h.type !== "BULLION");

  const bullionValue = bullionHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const financialValue = financialHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalValue = bullionValue + financialValue;

  const allocation = portfolio.holdings.reduce(
    (acc, h) => {
      const key = h.type.toLowerCase();
      acc[key] = (acc[key] || 0) + h.marketValue;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    portfolio: {
      id: portfolio.id,
      name: portfolio.name,
      currency: portfolio.currency,
      asOfDate: portfolio.asOfDate,
      totalValue,
      bullionValue,
      financialValue,
      holdings: portfolio.holdings,
      bullionHoldings,
      financialHoldings,
      allocation,
      performance: portfolio.performance,
    },
  });
}
