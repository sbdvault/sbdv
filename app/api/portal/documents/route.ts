import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { getUploadsRoot } from "@/lib/data-paths";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: { orderBy: { uploadedAt: "desc" } } },
  });

  return NextResponse.json({ documents: profile?.documents || [] });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string) || file?.name || "Document";
  const type = (formData.get("type") as string) || "OTHER";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const uploadDir = getUploadsRoot(profile.id);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${uploadDir}/${Date.now()}-${file.name}`;
  await writeFile(filePath, buffer);

  const document = await prisma.document.create({
    data: {
      clientProfileId: profile.id,
      name,
      type: type as string,
      filePath,
      fileSize: buffer.length,
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId: session.user.id,
      action: "DOCUMENT_UPLOAD",
      details: document.name,
    },
  });

  return NextResponse.json({ document });
}
