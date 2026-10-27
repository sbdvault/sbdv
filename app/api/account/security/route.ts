import { auth } from "@/auth";
import { toSignInSnapshot } from "@/lib/login-audit";
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

  const logins = await prisma.auditEvent.findMany({
    where: { userId: session.user.id, action: "LOGIN" },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: { createdAt: true, ipAddress: true, details: true },
  });

  const currentSignIn = logins[0] ? toSignInSnapshot(logins[0]) : null;
  const previousSignIn = logins[1] ? toSignInSnapshot(logins[1]) : null;

  return NextResponse.json({
    email: user.email,
    name: user.name,
    role: user.role,
    mfaEnabled: user.mfaEnabled,
    mfaMethod: user.mfaMethod,
    memberSince: user.createdAt.toISOString(),
    lastSignInAt: currentSignIn?.at ?? null,
    currentSignIn,
    previousSignIn,
  });
}
