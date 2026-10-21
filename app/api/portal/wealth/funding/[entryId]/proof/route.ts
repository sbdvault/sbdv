import { prisma } from "@/lib/prisma";
import { sendNotifications } from "@/lib/email";
import { getUploadsRoot } from "@/lib/data-paths";
import { mandateForUserId, requireSignedIn } from "@/lib/wealth-access";
import { sendWealthProofUploadedEmails } from "@/lib/wealth-emails";
import {
  WEALTH_PAYMENT_DOC_TYPE,
  WEALTH_STATUS,
  isDepositType,
  serializeMandateWithProofs,
} from "@/lib/wealth-mandate";
import { validateUploadFile } from "@/lib/upload-validation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const gate = await requireSignedIn();
  if ("error" in gate) return gate.error;

  const mandate = await mandateForUserId(gate.session.user.id);
  if (!mandate) {
    return NextResponse.json({ error: "No wealth mandate" }, { status: 404 });
  }

  const { entryId } = await params;
  const entry = mandate.entries.find((row) => row.id === entryId);
  if (!entry || !isDepositType(entry.type)) {
    return NextResponse.json({ error: "Funding notice not found" }, { status: 404 });
  }
  if (entry.status !== WEALTH_STATUS.INSTRUCTED) {
    return NextResponse.json(
      { error: "Payment proof can be uploaded after instructions are issued" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Attach a payment file" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be 10 MB or smaller" }, { status: 400 });
  }
  const check = validateUploadFile({ name: file.name, type: file.type });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const btcTxid = String(formData.get("btcTxid") || "").trim() || null;
  const clientNote = String(formData.get("clientNote") || "").trim() || null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "payment";
  const uploadDir = getUploadsRoot(mandate.clientProfileId, "wealth-funding", entry.id);
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${Date.now()}-${safeName}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  await prisma.document.create({
    data: {
      clientProfileId: mandate.clientProfileId,
      name: file.name,
      type: WEALTH_PAYMENT_DOC_TYPE,
      filePath,
      fileSize: buffer.length,
    },
  });

  await prisma.wealthLedgerEntry.update({
    where: { id: entry.id },
    data: {
      status: WEALTH_STATUS.PROOF_UPLOADED,
      btcTxid: btcTxid || entry.btcTxid,
      clientNote: clientNote || entry.clientNote,
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId: gate.session.user.id,
      action: "WEALTH_PAYMENT_PROOF_UPLOADED",
      details: JSON.stringify({ mandateId: mandate.id, entryId: entry.id, name: file.name }),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: gate.session.user.id } });
  await sendNotifications([
    sendWealthProofUploadedEmails({
      email: user?.email || gate.session.user.email || "",
      name: user?.name || null,
      amountUsd: entry.amountUsd,
      method: entry.type,
      reference: entry.paymentReference || entry.id,
      filename: file.name,
      filePath,
    }),
  ]);

  const fresh = await mandateForUserId(gate.session.user.id);
  return NextResponse.json({
    mandate: fresh ? await serializeMandateWithProofs(fresh) : null,
  });
}
