import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const applications = await prisma.membershipApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { clientProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications, clients });
}
