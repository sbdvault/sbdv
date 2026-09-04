import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getNextAdminAction,
  hasDisburseBankDetails,
  hasPaymentSlip,
  hasRequiredDocuments,
} from "@/lib/capital-access-onboarding";
import { sendOnboardingPhaseEmail } from "@/lib/capital-access-onboarding-emails";
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
  const { action, relationshipManager } = body;

  try {
    const facility = await prisma.capitalAccessRequest.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        documents: true,
      },
    });

    if (!facility || facility.status !== "APPROVED") {
      return NextResponse.json({ error: "Approved facility not found" }, { status: 404 });
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
        // Legacy: if docs were never collected before approval, collect them next
        if (!hasRequiredDocuments(facility.documents.map((d) => d.type))) {
          nextPhase = "AWAITING_DOCUMENTS";
        }
      }

      if (
        facility.onboardingPhase === "AWAITING_DOCUMENTS" &&
        !hasRequiredDocuments(facility.documents.map((d) => d.type))
      ) {
        return NextResponse.json({ error: "Required documents not yet uploaded" }, { status: 400 });
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
        sendOnboardingPhaseEmail(
          facility.user.email,
          facility.user.name,
          facility.companyName,
          nextPhase
        ).catch(console.error);
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
