import { sendEmail, getAdminEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a1a1a;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37; letter-spacing: 0.1em;">MEMBERSHIP</p>
  </div>
  <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">Automated message from SBDV Membership.</p>
</body>
</html>`;
}

export async function sendMembershipApplicationEmails(params: {
  name: string;
  email: string;
  phone: string;
  country: string;
  assetRange: string;
  message: string;
}) {
  const adminEmail = await getAdminEmail();
  const safe = {
    name: escapeHtml(params.name),
    email: escapeHtml(params.email),
    phone: escapeHtml(params.phone),
    country: escapeHtml(params.country),
    assetRange: escapeHtml(params.assetRange),
    message: escapeHtml(params.message).replace(/\n/g, "<br />"),
  };

  await sendEmail({
    to: adminEmail,
    replyTo: params.email,
    subject: `[SBDV Membership] ${params.name}`,
    html: emailLayout(
      "New membership application",
      `
      <p>A membership application requires review.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}" style="color: #D4AF37;">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${safe.phone}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Country</td><td style="padding: 8px 0;">${safe.country}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Asset range</td><td style="padding: 8px 0;">${safe.assetRange}</td></tr>
      </table>
      <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Message</p>
      <div style="background: #f7f5f0; border-left: 3px solid #D4AF37; padding: 16px; font-size: 14px;">
        ${safe.message}
      </div>
      `
    ),
    text: `Membership application from ${params.name} (${params.email}).`,
  });

  await sendEmail({
    to: params.email,
    subject: "SBDV Membership Application Received",
    html: emailLayout(
      "We received your application",
      `
      <p>Dear ${safe.name},</p>
      <p>Thank you for applying to Swiss Bullion Depository Vault. Our membership desk will review your application and contact you shortly.</p>
      `
    ),
    text: "Thank you for applying to SBDV. Our membership desk will contact you shortly.",
  });
}

export async function sendMembershipDecisionEmail(params: {
  email: string;
  name: string;
  decision: "APPROVED" | "REJECTED";
}) {
  const safeName = escapeHtml(params.name);
  if (params.decision === "REJECTED") {
    await sendEmail({
      to: params.email,
      subject: "SBDV Membership Application Update",
      html: emailLayout(
        "Application update",
        `
        <p>Dear ${safeName},</p>
        <p>Thank you for your interest in Swiss Bullion Depository Vault. After careful review, we are unable to proceed with membership at this time.</p>
        <p>You may contact us if you wish to discuss this decision or reapply in the future.</p>
        `
      ),
      text: "Your SBDV membership application was not approved at this time.",
    });
    return;
  }

  await sendEmail({
    to: params.email,
    subject: "SBDV Membership Approved",
    html: emailLayout(
      "Membership approved",
      `
      <p>Dear ${safeName},</p>
      <p>Your membership application has been approved. If portal credentials were issued, please check your email for sign-in details.</p>
      `
    ),
    text: "Your SBDV membership application has been approved.",
  });
}
