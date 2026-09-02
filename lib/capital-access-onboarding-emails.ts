import { sendEmail } from "@/lib/email";

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html><html><body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37;">CAPITAL ACCESS — FACILITY ONBOARDING</p>
  </div>
  <h2 style="font-size: 18px;">${title}</h2>${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">Automated message from SBDV Capital Access.</p>
</body></html>`;
}

const phaseMessages: Record<string, { subject: string; title: string; body: string }> = {
  AWAITING_DEPOSIT: {
    subject: "Facility Approved — Security Deposit Required",
    title: "Your facility is approved",
    body: `<p>Transfer your 10% security deposit using the escrow instructions in your <strong>Facility Dashboard</strong>. Include the wire reference exactly as shown.</p>`,
  },
  AWAITING_DOCUMENTS: {
    subject: "Deposit Confirmed — Submit Documentation",
    title: "Security deposit confirmed",
    body: `<p>Your deposit has been verified. Upload audited financials, signed facility agreement, KYC disclosure, and deployment plan within <strong>14 business days</strong>.</p>`,
  },
  KYC_REVIEW: {
    subject: "Documents Received — KYC Under Review",
    title: "Compliance review in progress",
    body: `<p>Your documentation package is complete. Our compliance team is conducting final KYC/AML verification. No action required.</p>`,
  },
  READY_FOR_DISBURSEMENT: {
    subject: "KYC Complete — Disbursement Pending",
    title: "Ready for capital release",
    body: `<p>All compliance checks passed. Your facility is cleared for disbursement per your approved investment mandate. Funds will be released shortly.</p>`,
  },
  DISBURSED: {
    subject: "Capital Disbursed",
    title: "Funds have been released",
    body: `<p>Capital has been disbursed to your designated account. Your repayment schedule is now active. View details in your Facility Dashboard.</p>`,
  },
  ACTIVE: {
    subject: "Facility Now Active",
    title: "Your facility is active",
    body: `<p>Your capital access facility is fully operational. Repayments are due per your agreed schedule. Contact your relationship manager for any questions.</p>`,
  },
};

export async function sendOnboardingPhaseEmail(
  email: string,
  name: string | null,
  companyName: string,
  phase: string
) {
  const msg = phaseMessages[phase];
  if (!msg) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await sendEmail({
    to: email,
    subject: msg.subject,
    html: emailLayout(
      msg.title,
      `
      <p>Dear ${name || "Capital Partner"},</p>
      <p>Regarding <strong>${companyName}</strong>:</p>
      ${msg.body}
      <p><a href="${siteUrl}/en/capital-access/portal/facility" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#1a1a1a;text-decoration:none;font-weight:bold;">Open Facility Dashboard</a></p>
      `
    ),
  });
}

export async function sendDepositSubmittedEmail(
  adminEmail: string,
  companyName: string,
  depositReference: string,
  amount: number
) {
  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  await sendEmail({
    to: adminEmail,
    subject: `[Action] Deposit Wire Submitted — ${companyName}`,
    html: emailLayout(
      "Borrower submitted deposit reference",
      `<p><strong>${companyName}</strong> has submitted a wire reference: <code>${depositReference}</code></p>
       <p>Expected amount: ${formatUsd(amount)}. Verify in admin and confirm deposit.</p>`
    ),
  });
}
