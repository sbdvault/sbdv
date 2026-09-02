import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  PAYMENT_SLIP_TYPE,
  REQUIRED_DOCUMENT_TYPES,
} from "@/lib/capital-access-onboarding";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadsRoot } from "@/lib/data-paths";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "OTHER";
  const name = (formData.get("name") as string) || file?.name || "Document";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isPaymentSlip = type === PAYMENT_SLIP_TYPE;
  const isRequiredDoc = REQUIRED_DOCUMENT_TYPES.includes(
    type as (typeof REQUIRED_DOCUMENT_TYPES)[number]
  );

  if (!isPaymentSlip && !isRequiredDoc && type !== "OTHER") {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const facility = await prisma.capitalAccessRequest.findFirst({
    where: {
      id,
      userId: session.user.id,
      status: "APPROVED",
      onboardingPhase: isPaymentSlip
        ? "AWAITING_DEPOSIT"
        : { in: ["AWAITING_DOCUMENTS", "KYC_REVIEW"] },
    },
    include: { documents: true },
  });

  if (!facility) {
    return NextResponse.json({ error: "Document upload not available at this stage" }, { status: 403 });
  }

  if (isPaymentSlip && facility.depositSubmittedAt) {
    return NextResponse.json(
      { error: "Deposit already submitted — contact your relationship manager to replace the slip" },
      { status: 400 }
    );
  }

  const uploadDir = getUploadsRoot("capital-access", id);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(uploadDir, `${Date.now()}-${safeName}`);
  await writeFile(filePath, buffer);

  if (isPaymentSlip) {
    const existing = facility.documents.filter((d) => d.type === PAYMENT_SLIP_TYPE);
    if (existing.length) {
      await prisma.capitalAccessDocument.deleteMany({
        where: { requestId: id, type: PAYMENT_SLIP_TYPE },
      });
    }
  }

  const document = await prisma.capitalAccessDocument.create({
    data: {
      requestId: id,
      name,
      type,
      filePath,
      fileSize: buffer.length,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
