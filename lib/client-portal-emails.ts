import { sendEmail, getAdminEmail } from "@/lib/email";

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a1a1a;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37; letter-spacing: 0.1em;">PRIVATE CLIENT PORTAL</p>
  </div>
  <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">Automated message from SBDV. Do not reply directly to this email.</p>
</body>
</html>`;
}

/** Sent when admin approves membership and creates a CLIENT portal account. */
export async function sendClientPortalWelcomeEmail(params: {
  email: string;
  name: string | null;
  tempPassword: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await sendEmail({
    to: params.email,
    subject: "Your SBDV private client portal is ready",
    html: emailLayout(
      "Portal access confirmed",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Your membership has been approved. A private client portal account is now active for this email address.</p>
      <p><strong>Temporary password:</strong> <code style="background:#f7f5f0;padding:4px 8px;">${params.tempPassword}</code></p>
      <p>Sign in and change this password after your first visit. Enable email or authenticator MFA in Settings when ready.</p>
      <p><a href="${siteUrl}/en/login" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Sign in to your portal</a></p>
      `
    ),
    text: `Your SBDV portal is ready. Temporary password: ${params.tempPassword}. Sign in at ${siteUrl}/en/login`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Client portal provisioned — ${params.name || params.email}`,
    html: emailLayout(
      "Client portal account created",
      `
      <p>A private client portal account was provisioned after membership approval.</p>
      <p><strong>${params.name || "—"}</strong> &lt;${params.email}&gt;</p>
      <p>Welcome credentials were emailed to the client.</p>
      `
    ),
    text: `Client portal created for ${params.name} <${params.email}>`,
  });
}
