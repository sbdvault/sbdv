import { sendEmail } from "@/lib/email";

function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px;">Swiss Bullion Depository Vault</h1>
  </div>
  <h2 style="font-size: 18px;">${title}</h2>
  ${body}
  <p style="font-size: 12px; color: #888; margin-top: 32px;">If you did not make this change, contact support immediately.</p>
</body></html>`;
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string | null | undefined
) {
  const greeting = name?.trim() ? `Hello ${name.trim()},` : "Hello,";
  await sendEmail({
    to: email,
    subject: "Your SBDV password was changed",
    html: emailLayout(
      "Password changed",
      `<p>${greeting}</p>
      <p>The password for your SBDV account (<strong>${email}</strong>) was changed successfully.</p>
      <p>If you did not authorize this change, reset your password immediately and contact our security team.</p>`
    ),
    text: `${greeting}\n\nThe password for your SBDV account (${email}) was changed successfully.\n\nIf you did not authorize this change, reset your password immediately.`,
  });
}
