import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPoolTeaser } from "@/lib/capital-access";
import {
  getEscrowInstructions,
  hasRequiredDocuments,
  ONBOARDING_PHASES,
  PAYMENT_SLIP_TYPE,
} from "@/lib/capital-access-onboarding";
import { sendDepositSubmittedEmail } from "@/lib/capital-access-onboarding-emails";
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
        status: "APPROVED",
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
      await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          onboardingPhase: "AWAITING_DEPOSIT",
          relationshipManager: facility.relationshipManager || "Capital Access Desk",
        },
      });
      facility.onboardingPhase = "AWAITING_DEPOSIT";
      facility.relationshipManager = facility.relationshipManager || "Capital Access Desk";
    }

    return NextResponse.json({
      facility: {
        ...facility,
        poolLabel: getPoolTeaser(facility.pool.country, facility.pool.category).label,
        escrow: getEscrowInstructions(facility.id, facility.companyName, facility),
        paymentSlip: facility.documents.find((d) => d.type === PAYMENT_SLIP_TYPE) || null,
        docsComplete: hasRequiredDocuments(facility.documents.map((d) => d.type)),
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
  const { depositReference } = body;

  try {
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
    return NextResponse.json({ error: "Failed to submit deposit reference" }, { status: 500 });
  }
}
