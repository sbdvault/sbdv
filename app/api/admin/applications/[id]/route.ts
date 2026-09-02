import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

async function seedPortfolioForUser(userId: string) {
  let profile = await prisma.clientProfile.findUnique({ where: { userId } });

  if (!profile) {
    profile = await prisma.clientProfile.create({
      data: { userId, tier: "standard" },
    });
  }

  const existing = await prisma.portfolio.findFirst({
    where: { clientProfileId: profile.id },
  });

  if (existing) return existing;

  const portfolio = await prisma.portfolio.create({
    data: {
      clientProfileId: profile.id,
      name: "Primary Portfolio",
      currency: "USD",
      holdings: {
        create: [
          {
            type: "BULLION",
            name: "Gold Bars (LBMA)",
            quantity: 50,
            unit: "oz",
            costBasis: 95000,
            marketValue: 102500,
            purity: "999.9",
            vaultLocation: "Zurich, Switzerland",
            auditStatus: "verified",
          },
          {
            type: "BULLION",
            name: "Silver Bars",
            quantity: 500,
            unit: "oz",
            costBasis: 12000,
            marketValue: 13500,
            purity: "999.0",
            vaultLocation: "Zurich, Switzerland",
            auditStatus: "verified",
          },
          {
            type: "EQUITY",
            name: "Global Equity ETF",
            symbol: "VT",
            quantity: 200,
            costBasis: 22000,
            marketValue: 24800,
          },
          {
            type: "BOND",
            name: "Swiss Government Bonds",
            symbol: "SWISS-BOND",
            quantity: 100,
            costBasis: 98000,
            marketValue: 99500,
          },
          {
            type: "ALTERNATIVE",
            name: "Private Market Fund",
            symbol: "PMF-I",
            quantity: 1,
            costBasis: 75000,
            marketValue: 82000,
          },
        ],
      },
      performance: {
        create: [
          { period: "ytd", returnPct: 8.2, benchmarkPct: 6.5 },
          { period: "1y", returnPct: 12.4, benchmarkPct: 10.1 },
          { period: "3y", returnPct: 28.6, benchmarkPct: 24.2 },
          { period: "all", returnPct: 45.3, benchmarkPct: 38.7 },
        ],
      },
    },
  });

  return portfolio;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await request.json();

  const application = await prisma.membershipApplication.findUnique({
    where: { id },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.membershipApplication.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "approve") {
    let user = await prisma.user.findUnique({
      where: { email: application.email },
    });

    const tempPassword = "SBDV" + Math.random().toString(36).slice(2, 10) + "!";

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: application.email,
          name: application.name,
          passwordHash: await bcrypt.hash(tempPassword, 12),
          role: "CLIENT",
        },
      });

      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          tier: "standard",
          country: application.country,
          phone: application.phone,
        },
      });
    }

    await seedPortfolioForUser(user.id);

    await prisma.membershipApplication.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({
      success: true,
      message: "Client approved and portfolio seeded",
      ...(isNewUser ? { tempPassword } : {}),
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await seedPortfolioForUser(id);

  return NextResponse.json({ success: true });
}
