import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  canBorrowerUploadDocuments,
  PAYMENT_SLIP_TYPE,
} from "@/lib/capital-access-onboarding";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, docId } = await params;

  const facility = await prisma.capitalAccessRequest.findFirst({
    where: { id, userId: session.user.id },
    include: { documents: true },
  });

  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  const document = facility.documents.find((d) => d.id === docId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isPaymentSlip = document.type === PAYMENT_SLIP_TYPE;

  if (isPaymentSlip) {
    if (
      facility.status !== "APPROVED" ||
      facility.onboardingPhase !== "AWAITING_DEPOSIT" ||
      facility.depositSubmittedAt
    ) {
      return NextResponse.json(
        { error: "Payment slip cannot be deleted at this stage" },
        { status: 403 }
      );
    }
  } else if (!canBorrowerUploadDocuments(facility.status, facility.onboardingPhase)) {
    return NextResponse.json(
      { error: "Documents cannot be deleted at this stage" },
      { status: 403 }
    );
  }

  await unlink(document.filePath).catch(() => {});
  await prisma.capitalAccessDocument.delete({ where: { id: docId } });

  return NextResponse.json({ ok: true });
}
