import { sendEmail, getContactEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function interestLabel(interest: string) {
  const labels: Record<string, string> = {
    "private-vault": "Private Vault",
    "bullion-custody": "Bullion Custody",
    insurance: "Insurance",
    "vip-viewing": "VIP Viewing",
    "investment-advisory": "Investment Advisory",
    "portfolio-management": "Portfolio Management",
    "alternative-investments": "Alternative Investments",
    membership: "Membership",
    general: "General Inquiry",
  };
  return labels[interest] || interest;
}

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a1a1a;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37; letter-spacing: 0.1em;">PRIVATE INQUIRY</p>
  </div>
  <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">Submitted via the SBDV Contact / Private Inquiry form. Reply to this email to respond to the sender.</p>
</body>
</html>`;
}

export async function sendContactInquiryEmail(params: {
  name: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  message: string;
}): Promise<boolean> {
  const to = getContactEmail();
  const interest = interestLabel(params.interest);
  const safe = {
    name: escapeHtml(params.name),
    email: escapeHtml(params.email),
    phone: escapeHtml(params.phone),
    country: escapeHtml(params.country),
    interest: escapeHtml(interest),
    message: escapeHtml(params.message).replace(/\n/g, "<br />"),
  };

  return sendEmail({
    to,
    replyTo: params.email,
    subject: `[SBDV Inquiry] ${interest} — ${params.name}`,
    html: emailLayout(
      "New private inquiry",
      `
      <p>A new contact form submission requires your attention.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}" style="color: #D4AF37;">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${safe.phone}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Country</td><td style="padding: 8px 0;">${safe.country}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Interest</td><td style="padding: 8px 0;">${safe.interest}</td></tr>
      </table>
      <p style="margin-bottom: 8px; color: #666; font-size: 13px;">Message</p>
      <div style="background: #f7f5f0; border-left: 3px solid #D4AF37; padding: 16px; font-size: 14px;">
        ${safe.message}
      </div>
      `
    ),
    text: [
      "New SBDV private inquiry",
      "",
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Phone: ${params.phone}`,
      `Country: ${params.country}`,
      `Interest: ${interest}`,
      "",
      "Message:",
      params.message,
    ].join("\n"),
  });
}
