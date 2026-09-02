import { auth } from "@/auth";
import { getPoolTeaser } from "@/lib/capital-access";
import { getEscrowInstructions } from "@/lib/capital-access-onboarding";
import { prisma } from "@/lib/prisma";

export interface ChatUserContext {
  isAuthenticated: boolean;
  role: string;
  name: string | null;
  email: string | null;
  summary: string;
  details: Record<string, unknown>;
}

export async function buildChatUserContext(): Promise<ChatUserContext> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      isAuthenticated: false,
      role: "guest",
      name: null,
      email: null,
      summary: "Visitor is not logged in. Guide them to membership, capital access, or login.",
      details: {},
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return {
      isAuthenticated: false,
      role: "guest",
      name: null,
      email: null,
      summary: "Session invalid.",
      details: {},
    };
  }

  const base = {
    isAuthenticated: true,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  if (user.role === "CLIENT") {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      include: {
        portfolios: { include: { holdings: true, performance: { take: 1, orderBy: { recordedAt: "desc" } } } },
        documents: true,
      },
    });

    const portfolio = profile?.portfolios[0];
    const totalValue = portfolio?.holdings.reduce((s, h) => s + h.marketValue, 0) ?? 0;
    const bullion = portfolio?.holdings.filter((h) => h.type === "BULLION") ?? [];
    const bullionValue = bullion.reduce((s, h) => s + h.marketValue, 0);
    const ytd = portfolio?.performance.find((p) => p.period === "ytd");

    const summary = `Logged-in CLIENT: ${user.name || user.email}. Tier: ${profile?.tier ?? "standard"}. Portfolio value: $${totalValue.toLocaleString()}. Bullion: $${bullionValue.toLocaleString()}. Documents on file: ${profile?.documents.length ?? 0}.`;

    return {
      ...base,
      summary,
      details: {
        tier: profile?.tier,
        country: profile?.country,
        portfolioTotalUsd: totalValue,
        bullionValueUsd: bullionValue,
        bullionItems: bullion.map((h) => ({
          name: h.name,
          quantity: h.quantity,
          unit: h.unit,
          vault: h.vaultLocation,
          value: h.marketValue,
        })),
        holdingsCount: portfolio?.holdings.length ?? 0,
        ytdReturnPct: ytd?.returnPct,
        documentCount: profile?.documents.length ?? 0,
      },
    };
  }

  if (user.role === "BORROWER") {
    const applications = await prisma.capitalAccessRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { pool: { select: { country: true, category: true } } },
    });

    const approved = applications.filter((a) => a.status === "APPROVED");
    const latest = applications[0];

    const summary = `Logged-in BORROWER (Capital Access partner): ${user.name || user.email}. Applications: ${applications.length}. Approved facilities: ${approved.length}. Latest status: ${latest?.status ?? "none"}.`;

    return {
      ...base,
      summary,
      details: {
        applications: applications.map((a) => {
          const base = {
            id: a.id,
            company: a.companyName,
            status: a.status,
            amountUsd: a.requestedAmountUsd,
            apr: a.interestRatePct,
            termYears: a.termYears,
            securityDepositUsd: a.securityDepositUsd,
            onboardingPhase: a.onboardingPhase,
            pool: getPoolTeaser(a.pool.country, a.pool.category).label,
          };
          if (a.status === "APPROVED" && a.onboardingPhase === "AWAITING_DEPOSIT") {
            const escrow = getEscrowInstructions(a.id, a.companyName, a);
            return {
              ...base,
              escrow: {
                bankName: escrow.bankName,
                bankAddress: escrow.bankAddress,
                accountName: escrow.accountName,
                accountNumber: escrow.accountNumber,
                iban: escrow.iban,
                swift: escrow.swift,
                reference: escrow.reference,
                beneficiary: escrow.beneficiary,
                beneficiaryAddress: escrow.beneficiaryAddress,
              },
            };
          }
          return base;
        }),
      },
    };
  }

  if (user.role === "ADMIN") {
    const [pendingMembership, pendingCapital, sovereignCount, directiveCount] = await Promise.all([
      prisma.membershipApplication.count({ where: { status: "PENDING" } }),
      prisma.capitalAccessRequest.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
      prisma.globalWealthEntity.count({ where: { category: "SOVEREIGN" } }),
      prisma.wealthInvestmentDirective.count({ where: { status: "PENDING" } }),
    ]);

    const summary = `Logged-in ADMIN: ${user.name || user.email}. Pending membership: ${pendingMembership}. Capital access queue: ${pendingCapital}. Sovereign entities: ${sovereignCount}. Pending directives: ${directiveCount}.`;

    return {
      ...base,
      summary,
      details: {
        pendingMembershipApplications: pendingMembership,
        pendingCapitalAccess: pendingCapital,
        sovereignEntityCount: sovereignCount,
        pendingDirectives: directiveCount,
      },
    };
  }

  return {
    ...base,
    summary: `Logged-in user (${user.role}): ${user.name || user.email}.`,
    details: { role: user.role },
  };
}
