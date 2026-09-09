import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const OTP_TTL_MS = 10 * 60 * 1000;

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37;">SECURE SIGN-IN</p>
  </div>
  <h2 style="font-size: 18px;">${title}</h2>${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">If you did not attempt to sign in, ignore this message and contact SBDV.</p>
</body></html>`;
}

export async function issueEmailOtp(userId: string, email: string, name: string | null) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const emailOtpHash = await bcrypt.hash(code, 10);
  const emailOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: { emailOtpHash, emailOtpExpiresAt },
  });

  await sendEmail({
    to: email,
    subject: "Your SBDV sign-in code",
    html: emailLayout(
      "Your authentication code",
      `
      <p>Dear ${name || "Client"},</p>
      <p>Use this code to finish signing in. It expires in 10 minutes.</p>
      <p style="font-size: 28px; letter-spacing: 0.25em; font-weight: bold; text-align: center; margin: 24px 0;">${code}</p>
      `
    ),
    text: `Your SBDV sign-in code is ${code}. It expires in 10 minutes.`,
  });
}

export async function verifyEmailOtp(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailOtpHash: true, emailOtpExpiresAt: true },
  });
  if (!user?.emailOtpHash || !user.emailOtpExpiresAt) return false;
  if (user.emailOtpExpiresAt.getTime() < Date.now()) return false;

  const valid = await bcrypt.compare(code.trim(), user.emailOtpHash);
  if (!valid) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { emailOtpHash: null, emailOtpExpiresAt: null },
  });
  return true;
}

export function usesEmailMfa(user: {
  mfaEnabled: boolean;
  mfaMethod: string | null;
  mfaSecret: string | null;
}) {
  if (!user.mfaEnabled) return false;
  if (user.mfaMethod === "EMAIL") return true;
  if (user.mfaMethod === "TOTP") return false;
  // Legacy rows: TOTP if a secret exists, otherwise email OTP
  return !user.mfaSecret;
}
