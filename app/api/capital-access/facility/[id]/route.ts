import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPoolTeaser } from "@/lib/capital-access";
import {
  canBorrowerUploadDocuments,
  getEscrowInstructions,
  hasRequiredDocuments,
  ONBOARDING_PHASES,
  PAYMENT_SLIP_TYPE,
} from "@/lib/capital-access-onboarding";
import {
  sendDepositSubmittedEmail,
  sendDocumentsSubmittedEmail,
  sendOnboardingPhaseEmail,
} from "@/lib/capital-access-onboarding-emails";
import { getAdminEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const facility = await prisma.capitalAccessRequest.findFirst({
      where: {
        id,
        userId: session.user.id,
        status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED"] },
      },
      include: {
        pool: { select: { country: true, category: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    });

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    if (!facility.onboardingPhase) {
      const phase =
        facility.status === "APPROVED" ? "AWAITING_DEPOSIT" : "AWAITING_DOCUMENTS";
      await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          onboardingPhase: phase,
          relationshipManager: facility.relationshipManager || "Capital Access Desk",
        },
      });
      facility.onboardingPhase = phase;
      facility.relationshipManager = facility.relationshipManager || "Capital Access Desk";
    }

    return NextResponse.json({
      facility: {
        ...facility,
        poolLabel: getPoolTeaser(facility.pool.country, facility.pool.category).label,
        escrow: getEscrowInstructions(facility.id, facility.companyName, facility),
        paymentSlip: facility.documents.find((d) => d.type === PAYMENT_SLIP_TYPE) || null,
        docsComplete: hasRequiredDocuments(facility.documents.map((d) => d.type)),
        canUploadDocuments: canBorrowerUploadDocuments(facility.status, facility.onboardingPhase),
        phases: ONBOARDING_PHASES,
      },
    });
  } catch (err) {
    console.error("GET facility:", err);
    return NextResponse.json({ error: "Failed to load facility" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { depositReference, action } = body;

  try {
    if (action === "submit_documents") {
      const facility = await prisma.capitalAccessRequest.findFirst({
        where: {
          id,
          userId: session.user.id,
          status: { in: ["PENDING", "UNDER_REVIEW"] },
          onboardingPhase: { in: ["AWAITING_DOCUMENTS", "DOCUMENTS_REVISION"] },
        },
        include: {
          documents: true,
          user: { select: { email: true, name: true } },
        },
      });

      if (!facility) {
        return NextResponse.json(
          { error: "Document submission is not available at this stage" },
          { status: 403 }
        );
      }

      if (!hasRequiredDocuments(facility.documents.map((d) => d.type))) {
        return NextResponse.json(
          { error: "Upload all five required documents before submitting" },
          { status: 400 }
        );
      }

      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          status: "UNDER_REVIEW",
          onboardingPhase: "DOCUMENTS_SUBMITTED",
        },
      });

      const adminEmail = await getAdminEmail();
      sendDocumentsSubmittedEmail(adminEmail, facility.companyName, facility.id).catch(
        console.error
      );
      if (facility.user.email) {
        sendOnboardingPhaseEmail(
          facility.user.email,
          facility.user.name,
          facility.companyName,
          "DOCUMENTS_SUBMITTED"
        ).catch(console.error);
      }

      return NextResponse.json({ facility: updated });
    }

    const facility = await prisma.capitalAccessRequest.findFirst({
      where: {
        id,
        userId: session.user.id,
        status: "APPROVED",
        onboardingPhase: "AWAITING_DEPOSIT",
      },
      include: { documents: true },
    });

    if (!facility) {
      return NextResponse.json({ error: "Facility not found or not awaiting deposit" }, { status: 404 });
    }

    if (!depositReference?.trim()) {
      return NextResponse.json({ error: "Wire reference is required" }, { status: 400 });
    }

    if (!facility.documents.some((d) => d.type === PAYMENT_SLIP_TYPE)) {
      return NextResponse.json(
        { error: "Please upload your payment slip before submitting" },
        { status: 400 }
      );
    }

    const updated = await prisma.capitalAccessRequest.update({
      where: { id },
      data: {
        depositReference: depositReference.trim(),
        depositSubmittedAt: new Date(),
      },
    });

    const adminEmail = await getAdminEmail();
    sendDepositSubmittedEmail(
      adminEmail,
      facility.companyName,
      depositReference.trim(),
      facility.securityDepositUsd
    ).catch(console.error);

    return NextResponse.json({ facility: updated });
  } catch (err) {
    console.error("PATCH facility:", err);
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
  }
}
