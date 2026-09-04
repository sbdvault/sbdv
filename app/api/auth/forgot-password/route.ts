import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/password-reset";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = await createPasswordResetToken(email);
      await sendPasswordResetEmail(email, rawToken);
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("POST forgot-password:", err);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
