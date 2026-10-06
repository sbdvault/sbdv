import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const raw = randomBytes(32).toString("hex");
  const token = hashResetToken(raw);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: normalized } });
  await prisma.verificationToken.create({
    data: { identifier: normalized, token, expires },
  });

  return raw;
}

export async function consumePasswordResetToken(
  email: string,
  rawToken: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const token = hashResetToken(rawToken);
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.identifier !== normalized) return false;
  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return false;
  }

  await prisma.verificationToken.delete({ where: { token } });
  return true;
}

export async function sendPasswordResetEmail(email: string, rawToken: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/en/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

  await sendEmail({
    to: email,
    subject: "Reset your SBDV password",
    html: `
<!DOCTYPE html><html><body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px;">Swiss Bullion Depository Vault</h1>
  </div>
  <h2 style="font-size: 18px;">Password reset</h2>
  <p>We received a request to reset the password for this account.</p>
  <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#1a1a1a;text-decoration:none;font-weight:bold;">Reset password</a></p>
  <p style="font-size: 13px; color: #666;">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
  <p style="font-size: 12px; word-break: break-all; color: #888;">${resetUrl}</p>
</body></html>`,
    text: `Reset your SBDV password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}
