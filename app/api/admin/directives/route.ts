import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeDisclosedRange } from "@/lib/wealth-format";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const directives = await prisma.wealthInvestmentDirective.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      entity: {
        select: { name: true, vehicleName: true, country: true, category: true },
      },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    directives: directives.map((d) => ({
      id: d.id,
      entityName: d.entity.name,
      vehicleName: d.entity.vehicleName,
      country: d.entity.country,
      category: d.entity.category,
      amountUsdM: d.amountUsdM,
      assetClass: d.assetClass,
      directive: d.directive,
      status: d.status,
      notes: d.notes,
      createdAt: d.createdAt.toISOString(),
      createdBy: d.createdBy.name || d.createdBy.email,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { entityId, amountUsdM, assetClass, directive, notes } = body;

  if (!entityId || !amountUsdM || !assetClass || !directive?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entity = await prisma.globalWealthEntity.findUnique({ where: { id: entityId } });
  if (!entity) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const disclosed = computeDisclosedRange(
    entity.aumMinUsd,
    entity.aumMaxUsd,
    entity.displayFraction
  );
  const maxUsdM = disclosed.disclosedMax * 1000;

  const existing = await prisma.wealthInvestmentDirective.findMany({
    where: { entityId, status: { in: ["PENDING", "ACTIVE", "EXECUTED"] } },
  });
  const allocated = existing.reduce((s, d) => s + d.amountUsdM, 0);
  const available = maxUsdM - allocated;

  if (amountUsdM > available + 0.001) {
    return NextResponse.json(
      { error: `Amount exceeds available allocation ($${available.toFixed(1)}M)` },
      { status: 400 }
    );
  }

  const created = await prisma.wealthInvestmentDirective.create({
    data: {
      entityId,
      createdById: session.user.id,
      amountUsdM: parseFloat(amountUsdM),
      assetClass,
      directive: directive.trim(),
      notes: notes?.trim() || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ directive: created }, { status: 201 });
}
