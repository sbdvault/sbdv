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
  AWAITING_DOCUMENTS: {
    subject: "Capital Access — Submit Required Documents",
    title: "Submit your documentation package",
    body: `<p>Your capital access request has been received. Upload the <strong>five</strong> required documents in your <strong>Onboarding</strong> dashboard, then click <strong>Submit Documents</strong>:</p>
    <ul>
      <li>Audited Financial Statements</li>
      <li>Signed Facility Agreement</li>
      <li>KYC / Beneficial Ownership Disclosure</li>
      <li>Capital Deployment Plan</li>
      <li>Government ID / Driver’s Licence / Passport</li>
    </ul>
    <p>Accepted formats: <strong>PDF, DOC, or JPEG</strong>.</p>`,
  },
  DOCUMENTS_REVISION: {
    subject: "Capital Access — Additional Documents Required",
    title: "Additional documentation requested",
    body: `<p>Our review requires further documentation before we can approve your facility. Please review the notes in Onboarding, upload or replace files, then click <strong>Submit Documents</strong> again.</p>
    <p>Accepted formats: <strong>PDF, DOC, or JPEG</strong>.</p>`,
  },
  DOCUMENTS_SUBMITTED: {
    subject: "Documents Received — Under Review",
    title: "Your documents are under review",
    body: `<p>We have received your documentation package. Our capital desk will review it and either approve with escrow instructions or request additional documents.</p>`,
  },
  AWAITING_DEPOSIT: {
    subject: "Facility Approved — Security Deposit Required",
    title: "Your facility is approved",
    body: `<p>Your documents have been accepted and the facility is approved. Transfer your 10% security deposit using the escrow instructions in your <strong>Facility Dashboard</strong>. Include the wire reference exactly as shown.</p>`,
  },
  KYC_REVIEW: {
    subject: "Deposit Confirmed — KYC Under Review",
    title: "Compliance review in progress",
    body: `<p>Your security deposit has been verified. Our compliance team is conducting final KYC/AML verification. No action required.</p>`,
  },
  AWAITING_BANK_DETAILS: {
    subject: "KYC Complete — Submit Disbursement Bank Details",
    title: "Submit your disbursement bank account",
    body: `<p>KYC review is complete. Please open <strong>Onboarding</strong> and submit the bank account where we should disburse your approved facility amount (bank name, account name, IBAN, and SWIFT are required).</p>`,
  },
  READY_FOR_DISBURSEMENT: {
    subject: "Bank Details Received — Disbursement Pending",
    title: "Ready for capital release",
    body: `<p>Your disbursement bank details have been accepted. Your facility is cleared for capital release per your approved investment mandate. Funds will be released shortly.</p>`,
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
  phase: string,
  adminNotes?: string
) {
  const msg = phaseMessages[phase];
  if (!msg) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const notesBlock =
    adminNotes?.trim()
      ? `<p style="background:#f8f6f0;padding:12px;border-left:3px solid #D4AF37;"><strong>Review notes:</strong><br/>${adminNotes
          .trim()
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</p>`
      : "";

  await sendEmail({
    to: email,
    subject: msg.subject,
    html: emailLayout(
      msg.title,
      `
      <p>Dear ${name || "Capital Partner"},</p>
      <p>Regarding <strong>${companyName}</strong>:</p>
      ${msg.body}
      ${notesBlock}
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

export async function sendDocumentsSubmittedEmail(
  adminEmail: string,
  companyName: string,
  applicationId: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendEmail({
    to: adminEmail,
    subject: `[Action] Documents Submitted — ${companyName}`,
    html: emailLayout(
      "Borrower submitted documentation package",
      `<p><strong>${companyName}</strong> has submitted all five required documents for review.</p>
       <p><a href="${siteUrl}/en/admin/capital-access" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#1a1a1a;text-decoration:none;font-weight:bold;">Review in Admin</a></p>
       <p style="font-size:12px;color:#888;">Application ID: ${applicationId}</p>`
    ),
  });
}

export async function sendBankDetailsSubmittedEmail(
  adminEmail: string,
  companyName: string,
  applicationId: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendEmail({
    to: adminEmail,
    subject: `[Action] Disbursement Bank Details Submitted — ${companyName}`,
    html: emailLayout(
      "Borrower submitted disbursement bank details",
      `<p><strong>${companyName}</strong> has submitted bank account details for capital disbursement.</p>
       <p>Review the account in Admin, then advance to Ready for Disbursement when verified.</p>
       <p><a href="${siteUrl}/en/admin/capital-access" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#1a1a1a;text-decoration:none;font-weight:bold;">Review in Admin</a></p>
       <p style="font-size:12px;color:#888;">Application ID: ${applicationId}</p>`
    ),
  });
}
