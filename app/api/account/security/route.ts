import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      role: true,
      mfaEnabled: true,
      mfaMethod: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const lastLogin = await prisma.auditEvent.findFirst({
    where: { userId: session.user.id, action: "LOGIN" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return NextResponse.json({
    email: user.email,
    name: user.name,
    role: user.role,
    mfaEnabled: user.mfaEnabled,
    mfaMethod: user.mfaMethod,
    memberSince: user.createdAt.toISOString(),
    lastSignInAt: lastLogin?.createdAt.toISOString() ?? null,
  });
}
