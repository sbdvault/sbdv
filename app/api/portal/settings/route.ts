import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp, generateTotpSecret } from "@/lib/totp";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true },
  });

  return NextResponse.json({ mfaEnabled: user?.mfaEnabled || false });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, secret, code } = await request.json();

  if (action === "generate") {
    const newSecret = generateTotpSecret();
    return NextResponse.json({ secret: newSecret });
  }

  if (action === "enable") {
    if (!secret || !code) {
      return NextResponse.json({ error: "Secret and code required" }, { status: 400 });
    }

    const result = await verifyTotp({ token: code, secret });
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaSecret: secret, mfaEnabled: true },
    });

    await prisma.auditEvent.create({
      data: {
        userId: session.user.id,
        action: "MFA_ENABLED",
      },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "disable") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaSecret: null, mfaEnabled: false },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
