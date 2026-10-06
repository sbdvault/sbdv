import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBorrowerUploadDocuments } from "@/lib/capital-access-onboarding";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; uboId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, uboId } = await params;
  const facility = await prisma.capitalAccessRequest.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }
  if (!canBorrowerUploadDocuments(facility.status, facility.onboardingPhase)) {
    return NextResponse.json({ error: "Beneficial owners cannot be edited at this stage" }, { status: 403 });
  }

  await prisma.capitalAccessUbo.deleteMany({
    where: { id: uboId, requestId: id },
  });

  return NextResponse.json({ ok: true });
}
