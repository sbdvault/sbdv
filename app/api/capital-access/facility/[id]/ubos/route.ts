import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UBO_CONTROL_METHODS, canBorrowerUploadDocuments } from "@/lib/capital-access-onboarding";
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
  const facility = await prisma.capitalAccessRequest.findFirst({
    where:
      session.user.role === "ADMIN"
        ? { id }
        : { id, userId: session.user.id },
    include: { ubos: { orderBy: { createdAt: "asc" } } },
  });
  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }
  return NextResponse.json({ ubos: facility.ubos });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const facility = await prisma.capitalAccessRequest.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }
  if (!canBorrowerUploadDocuments(facility.status, facility.onboardingPhase)) {
    return NextResponse.json({ error: "Beneficial owners cannot be edited at this stage" }, { status: 403 });
  }

  const body = await request.json();
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const nationality = typeof body.nationality === "string" ? body.nationality.trim() : "";
  const domicileCountry = typeof body.domicileCountry === "string" ? body.domicileCountry.trim() : "";
  const controlMethod = (UBO_CONTROL_METHODS as readonly string[]).includes(body.controlMethod)
    ? body.controlMethod
    : "SHARES_25";

  if (!fullName || !nationality || !domicileCountry) {
    return NextResponse.json(
      { error: "Name, nationality, and domicile country are required" },
      { status: 400 }
    );
  }

  const ownershipPct =
    body.ownershipPct === null || body.ownershipPct === undefined || body.ownershipPct === ""
      ? null
      : Number(body.ownershipPct);
  if (ownershipPct != null && (Number.isNaN(ownershipPct) || ownershipPct < 0 || ownershipPct > 100)) {
    return NextResponse.json({ error: "Ownership % must be between 0 and 100" }, { status: 400 });
  }

  const ubo = await prisma.capitalAccessUbo.create({
    data: {
      requestId: id,
      fullName,
      dateOfBirth: typeof body.dateOfBirth === "string" && body.dateOfBirth.trim() ? body.dateOfBirth.trim() : null,
      nationality,
      domicileCountry,
      ownershipPct,
      controlMethod,
      pep: Boolean(body.pep),
    },
  });

  return NextResponse.json({ ubo }, { status: 201 });
}
