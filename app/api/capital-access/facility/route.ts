import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPoolTeaser } from "@/lib/capital-access";
import {
  canBorrowerUploadDocuments,
  getEscrowInstructions,
  hasDisburseBankDetails,
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
    // New apps start at docs; backfill older pending apps without a phase
    await prisma.capitalAccessRequest.updateMany({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "UNDER_REVIEW"] },
        onboardingPhase: null,
      },
      data: {
        onboardingPhase: "AWAITING_DOCUMENTS",
        relationshipManager: "Capital Access Desk",
      },
    });

    // Legacy approved with no phase → deposit (old first step)
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
        status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED"] },
        onboardingPhase: { not: null },
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
        status: f.status,
        companyName: f.companyName,
        requestedAmountUsd: f.requestedAmountUsd,
        securityDepositUsd: f.securityDepositUsd,
        interestRatePct: f.interestRatePct,
        termYears: f.termYears,
        repaymentFrequency: f.repaymentFrequency,
        installmentUsd: f.installmentUsd,
        onboardingPhase: f.onboardingPhase,
        adminNotes: f.adminNotes,
        depositReference: f.depositReference,
        depositSubmittedAt: f.depositSubmittedAt,
        depositConfirmedAt: f.depositConfirmedAt,
        kycCompletedAt: f.kycCompletedAt,
        disbursedAt: f.disbursedAt,
        relationshipManager: f.relationshipManager,
        disburseBankName: f.disburseBankName,
        disburseBankAddress: f.disburseBankAddress,
        disburseAccountName: f.disburseAccountName,
        disburseAccountNumber: f.disburseAccountNumber,
        disburseIban: f.disburseIban,
        disburseSwift: f.disburseSwift,
        disburseBeneficiary: f.disburseBeneficiary,
        disburseBeneficiaryAddress: f.disburseBeneficiaryAddress,
        bankDetailsSubmittedAt: f.bankDetailsSubmittedAt,
        bankDetailsComplete: hasDisburseBankDetails(f),
        poolLabel: getPoolTeaser(f.pool.country, f.pool.category).label,
        escrow: getEscrowInstructions(f.id, f.companyName, f),
        documents: f.documents,
        paymentSlip: f.documents.find((d) => d.type === PAYMENT_SLIP_TYPE) || null,
        docsComplete: hasRequiredDocuments(f.documents.map((d) => d.type)),
        canUploadDocuments: canBorrowerUploadDocuments(f.status, f.onboardingPhase),
        phases: ONBOARDING_PHASES,
      })),
    });
  } catch (err) {
    console.error("GET facilities:", err);
    return NextResponse.json({ error: "Failed to load facilities" }, { status: 500 });
  }
}
