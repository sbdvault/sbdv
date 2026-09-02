import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPoolTeaser } from "@/lib/capital-access";
import { getEscrowInstructions, validateEscrowInput } from "@/lib/capital-access-onboarding";
import { sendCapitalAccessDecisionEmail } from "@/lib/capital-access-emails";
import { sendOnboardingPhaseEmail } from "@/lib/capital-access-onboarding-emails";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const applications = await prisma.capitalAccessRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        pool: { select: { name: true, country: true, category: true } },
        documents: {
          select: { id: true, type: true, name: true, uploadedAt: true, fileSize: true },
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        ...a,
        poolLabel: getPoolTeaser(a.pool.country, a.pool.category).label,
        escrow: getEscrowInstructions(a.id, a.companyName, a),
      })),
    });
  } catch (err) {
    console.error("GET admin capital access:", err);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, adminNotes, escrow, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Application id required" }, { status: 400 });
    }

    if (action === "update_escrow") {
      const validated = validateEscrowInput({
        bankName: escrow?.bankName,
        bankAddress: escrow?.bankAddress,
        accountName: escrow?.accountName,
        accountNumber: escrow?.accountNumber,
        iban: escrow?.iban,
        swift: escrow?.swift,
        beneficiary: escrow?.beneficiary,
        beneficiaryAddress: escrow?.beneficiaryAddress,
        paymentReference: escrow?.paymentReference,
      });
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      const existing = await prisma.capitalAccessRequest.findUnique({
        where: { id },
        select: { companyName: true, status: true },
      });
      if (!existing || existing.status !== "APPROVED") {
        return NextResponse.json({ error: "Approved application not found" }, { status: 404 });
      }

      const updated = await prisma.capitalAccessRequest.update({
        where: { id },
        data: {
          escrowBankName: validated.data.escrowBankName,
          escrowBankAddress: validated.data.escrowBankAddress,
          escrowAccountName: validated.data.escrowAccountName,
          escrowAccountNumber: validated.data.escrowAccountNumber,
          escrowIban: validated.data.escrowIban,
          escrowSwift: validated.data.escrowSwift,
          escrowBeneficiary: validated.data.escrowBeneficiary || existing.companyName,
          escrowBeneficiaryAddress: validated.data.escrowBeneficiaryAddress,
          escrowPaymentRef:
            validated.data.escrowPaymentRef || `CAP-${String(id).slice(-8).toUpperCase()}`,
        },
      });

      return NextResponse.json({
        application: {
          ...updated,
          escrow: getEscrowInstructions(updated.id, updated.companyName, updated),
        },
      });
    }

    if (!status || !["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let escrowData: ReturnType<typeof validateEscrowInput>["data"] | undefined;

    if (status === "APPROVED") {
      const validated = validateEscrowInput({
        bankName: escrow?.bankName,
        bankAddress: escrow?.bankAddress,
        accountName: escrow?.accountName,
        accountNumber: escrow?.accountNumber,
        iban: escrow?.iban,
        swift: escrow?.swift,
        beneficiary: escrow?.beneficiary,
        beneficiaryAddress: escrow?.beneficiaryAddress,
        paymentReference: escrow?.paymentReference,
      });
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      escrowData = validated.data;
    }

    const existing = await prisma.capitalAccessRequest.findUnique({
      where: { id },
      select: { companyName: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await prisma.capitalAccessRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
        ...(status === "APPROVED" && escrowData
          ? {
              onboardingPhase: "AWAITING_DEPOSIT",
              relationshipManager: "Capital Access Desk",
              escrowBankName: escrowData.escrowBankName,
              escrowBankAddress: escrowData.escrowBankAddress,
              escrowAccountName: escrowData.escrowAccountName,
              escrowAccountNumber: escrowData.escrowAccountNumber,
              escrowIban: escrowData.escrowIban,
              escrowSwift: escrowData.escrowSwift,
              escrowBeneficiary: escrowData.escrowBeneficiary || existing.companyName,
              escrowBeneficiaryAddress: escrowData.escrowBeneficiaryAddress,
              escrowPaymentRef:
                escrowData.escrowPaymentRef || `CAP-${String(id).slice(-8).toUpperCase()}`,
            }
          : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (updated.user.email && ["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
      sendCapitalAccessDecisionEmail({
        borrowerEmail: updated.user.email,
        borrowerName: updated.user.name,
        companyName: updated.companyName,
        status: status as "APPROVED" | "REJECTED" | "UNDER_REVIEW",
        requestedAmountUsd: updated.requestedAmountUsd,
        securityDepositUsd: updated.securityDepositUsd,
        applicationId: updated.id,
      }).catch((err) => console.error("Decision email error:", err));

      if (status === "APPROVED") {
        sendOnboardingPhaseEmail(
          updated.user.email,
          updated.user.name,
          updated.companyName,
          "AWAITING_DEPOSIT"
        ).catch(console.error);
      }
    }

    return NextResponse.json({
      application: {
        ...updated,
        escrow: getEscrowInstructions(updated.id, updated.companyName, updated),
      },
    });
  } catch (err) {
    console.error("PATCH admin capital access:", err);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
