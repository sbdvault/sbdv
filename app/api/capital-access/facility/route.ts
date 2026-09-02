import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPoolTeaser } from "@/lib/capital-access";
import {
  getEscrowInstructions,
  hasRequiredDocuments,
  ONBOARDING_PHASES,
  PAYMENT_SLIP_TYPE,
} from "@/lib/capital-access-onboarding";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.capitalAccessRequest.updateMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        onboardingPhase: null,
      },
      data: {
        onboardingPhase: "AWAITING_DEPOSIT",
        relationshipManager: "Capital Access Desk",
      },
    });

    const facilities = await prisma.capitalAccessRequest.findMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
      },
      orderBy: { updatedAt: "desc" },
      include: {
        pool: { select: { country: true, category: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    });

    return NextResponse.json({
      facilities: facilities.map((f) => ({
        id: f.id,
        companyName: f.companyName,
        requestedAmountUsd: f.requestedAmountUsd,
        securityDepositUsd: f.securityDepositUsd,
        interestRatePct: f.interestRatePct,
        termYears: f.termYears,
        repaymentFrequency: f.repaymentFrequency,
        installmentUsd: f.installmentUsd,
        onboardingPhase: f.onboardingPhase,
        depositReference: f.depositReference,
        depositSubmittedAt: f.depositSubmittedAt,
        depositConfirmedAt: f.depositConfirmedAt,
        kycCompletedAt: f.kycCompletedAt,
        disbursedAt: f.disbursedAt,
        relationshipManager: f.relationshipManager,
        poolLabel: getPoolTeaser(f.pool.country, f.pool.category).label,
        escrow: getEscrowInstructions(f.id, f.companyName, f),
        documents: f.documents,
        paymentSlip: f.documents.find((d) => d.type === PAYMENT_SLIP_TYPE) || null,
        docsComplete: hasRequiredDocuments(f.documents.map((d) => d.type)),
        phases: ONBOARDING_PHASES,
      })),
    });
  } catch (err) {
    console.error("GET facilities:", err);
    return NextResponse.json({ error: "Failed to load facilities" }, { status: 500 });
  }
}
