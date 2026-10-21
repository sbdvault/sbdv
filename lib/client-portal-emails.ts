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

/** Sent when a private client self-registers from Wealth & Investment. */
export async function sendWealthSelfRegisterEmails(params: {
  email: string;
  name: string | null;
  country?: string;
  phone?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await sendEmail({
    to: params.email,
    subject: "Your SBDV wealth portal account is ready",
    html: emailLayout(
      "Welcome to your wealth mandate",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Your private-client wealth account is active. Sign in with the email and password you just created, then review the mandate and choose how much to fund by wire or Bitcoin.</p>
      <p>Principal is credited only after SBDV operations confirm receipt. Stated mandate yield is not a bank deposit.</p>
      <p><a href="${siteUrl}/en/login" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Sign in to your portal</a></p>
      `
    ),
    text: `Your SBDV wealth portal account is ready. Sign in at ${siteUrl}/en/login and choose a funding amount in Mandate → Funding.`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Wealth portal account — ${params.name || params.email}`,
    html: emailLayout(
      "New wealth portal registration",
      `
      <p>A private client created a wealth portal account from Wealth &amp; Investment.</p>
      <p><strong>${params.name || "—"}</strong> &lt;${params.email}&gt;</p>
      <p>Country: ${params.country || "—"} · Phone: ${params.phone || "—"}</p>
      <p>This is informational — the client can sign in immediately. Principal is still credited only after ops confirms a funding notice.</p>
      `
    ),
    text: `Wealth portal account created for ${params.name} <${params.email}> (${params.country || "—"}; ${params.phone || "—"})`,
  });
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

export async function sendPortalMessageNotifyEmail(params: {
  toEmail: string;
  toName: string | null;
  fromName: string | null;
  subject: string;
  preview: string;
  portalHref: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const preview = params.preview.slice(0, 400);

  await sendEmail({
    to: params.toEmail,
    subject: `[SBDV Message] ${params.subject}`,
    html: emailLayout(
      "New secure message",
      `
      <p>Dear ${params.toName || "Client"},</p>
      <p><strong>${params.fromName || "SBDV"}</strong> sent you a message:</p>
      <p style="font-size:16px;margin:16px 0;"><strong>${params.subject}</strong></p>
      <div style="background:#f7f5f0;border-left:3px solid #D4AF37;padding:16px;font-size:14px;">${preview.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</div>
      <p><a href="${siteUrl}${params.portalHref}" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Open messages</a></p>
      `
    ),
    text: `New message from ${params.fromName || "SBDV"}: ${params.subject}`,
  });
}
