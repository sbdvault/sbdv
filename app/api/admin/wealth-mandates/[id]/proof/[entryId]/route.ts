import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentProofForEntry, WEALTH_PAYMENT_DOC_TYPE } from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

function contentTypeFor(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, entryId } = await params;
  const mandate = await prisma.wealthMandate.findUnique({
    where: { id },
    select: { clientProfileId: true },
  });
  if (!mandate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const docs = await prisma.document.findMany({
    where: { clientProfileId: mandate.clientProfileId, type: WEALTH_PAYMENT_DOC_TYPE },
  });
  const document = paymentProofForEntry(docs, entryId);
  if (!document) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(document.filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypeFor(document.name),
        "Content-Disposition": `inline; filename="${document.name.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on server" }, { status: 404 });
  }
}
