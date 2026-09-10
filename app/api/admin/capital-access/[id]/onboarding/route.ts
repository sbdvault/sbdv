import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getNextAdminAction,
  hasCompleteKycPack,
  hasDisburseBankDetails,
  hasPaymentSlip,
  kycChecklistComplete,
} from "@/lib/capital-access-onboarding";
import { sendOnboardingPhaseEmail, sendRepaymentConfirmedEmail } from "@/lib/capital-access-onboarding-emails";
import {
  buildRepaymentSchedule,
  parseInstallmentPayments,
} from "@/lib/repayment-schedule";
import { sendNotifications } from "@/lib/email";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, relationshipManager, kyc } = body;

  try {
    const facility = await prisma.capitalAccessRequest.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        documents: true,
        ubos: { select: { id: true } },
      },
    });

    if (!facility || facility.status !== "APPROVED") {
      return NextResponse.json({ error: "Approved facility not found" }, { status: 404 });
    }

    if (action === "kyc_checklist") {
      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          kycUboLookthrough: Boolean(kyc?.ubo),
          kycSanctionsScreen: Boolean(kyc?.sanctions),
          kycSofAccepted: Boolean(kyc?.sof),
          kycEnhancedDd: Boolean(kyc?.enhancedDd),
        },
      });
      return NextResponse.json({ facility: updated });
    }

    if (action === "confirm_deposit" || action === "advance") {
      let nextPhase = getNextAdminAction(facility.onboardingPhase);
      if (!nextPhase) {
        return NextResponse.json({ error: "Cannot advance from current phase" }, { status: 400 });
      }

      if (facility.onboardingPhase === "AWAITING_DEPOSIT") {
        if (!facility.depositSubmittedAt) {
          return NextResponse.json(
            { error: "Borrower has not submitted deposit proof yet" },
            { status: 400 }
          );
        }
        if (!hasPaymentSlip(facility.documents.map((d) => d.type))) {
          return NextResponse.json(
            { error: "Payment slip has not been uploaded yet" },
            { status: 400 }
          );
        }
        if (!facility.depositSofSource) {
          return NextResponse.json(
            { error: "Borrower has not declared origin of the security deposit" },
            { status: 400 }
          );
        }
        // Legacy: if docs were never collected before approval, collect them next
        if (!hasCompleteKycPack(facility.documents.map((d) => d.type), facility.ubos.length)) {
          nextPhase = "AWAITING_DOCUMENTS";
        }
      }

      if (
        facility.onboardingPhase === "AWAITING_DOCUMENTS" &&
        !hasCompleteKycPack(facility.documents.map((d) => d.type), facility.ubos.length)
      ) {
        return NextResponse.json({ error: "Required documents not yet uploaded" }, { status: 400 });
      }

      if (facility.onboardingPhase === "KYC_REVIEW" && !kycChecklistComplete(facility)) {
        return NextResponse.json(
          { error: "Complete the KYC checklist (UBO, sanctions, origin of funds) before advancing" },
          { status: 400 }
        );
      }

      if (
        facility.onboardingPhase === "AWAITING_BANK_DETAILS" &&
        !hasDisburseBankDetails(facility)
      ) {
        return NextResponse.json(
          { error: "Borrower has not submitted disbursement bank details yet" },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = { onboardingPhase: nextPhase };

      if (facility.onboardingPhase === "AWAITING_DEPOSIT") {
        updateData.depositConfirmedAt = new Date();
      }
      if (nextPhase === "AWAITING_BANK_DETAILS") {
        updateData.kycCompletedAt = new Date();
      }
      if (nextPhase === "DISBURSED") {
        updateData.disbursedAt = new Date();
      }

      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: updateData,
      });

      if (facility.user.email) {
        await sendNotifications([
          sendOnboardingPhaseEmail(
            facility.user.email,
            facility.user.name,
            facility.companyName,
            nextPhase
          ),
        ]);
      }

      return NextResponse.json({ facility: updated });
    }

    if (action === "record_installment") {
      if (!["DISBURSED", "ACTIVE"].includes(facility.onboardingPhase || "")) {
        return NextResponse.json(
          { error: "Installments can be recorded only after disbursement" },
          { status: 400 }
        );
      }
      if (!facility.disbursedAt) {
        return NextResponse.json({ error: "Disbursement date is missing" }, { status: 400 });
      }

      const schedule = buildRepaymentSchedule({
        disbursedAt: facility.disbursedAt,
        termYears: facility.termYears,
        repaymentFrequency: facility.repaymentFrequency,
        principalUsd: facility.requestedAmountUsd,
        installmentUsd: facility.installmentUsd,
        payments: facility.installmentPayments,
      });
      const next = schedule.find((row) => row.status !== "PAID");
      if (!next) {
        return NextResponse.json({ error: "All installments are already recorded" }, { status: 400 });
      }

      const paidAt = new Date().toISOString();
      const existing = parseInstallmentPayments(facility.installmentPayments);
      const payments =
        next.status === "SUBMITTED"
          ? existing.map((row) =>
              row.installment === next.installment
                ? { ...row, status: "PAID" as const, paidAt }
                : row
            )
          : [
              ...existing,
              {
                installment: next.installment,
                amountUsd: next.amountUsd,
                status: "PAID" as const,
                submittedAt: paidAt,
                paidAt,
                reference: "",
                documentId: null,
              },
            ];

      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          installmentPayments: payments,
          onboardingPhase: "ACTIVE",
        },
      });

      if (facility.user.email) {
        await sendNotifications([
          sendRepaymentConfirmedEmail(
            facility.user.email,
            facility.user.name,
            facility.companyName,
            next.installment,
            next.amountUsd
          ),
        ]);
      }

      return NextResponse.json({ facility: updated });
    }

    if (action === "assign_rm" && relationshipManager?.trim()) {
      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: { relationshipManager: relationshipManager.trim() },
      });
      return NextResponse.json({ facility: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("PATCH onboarding:", err);
    return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
  }
}
