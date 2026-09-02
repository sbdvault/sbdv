import { sendEmail, getAdminEmail } from "@/lib/email";
import { getPoolTeaser } from "@/lib/capital-access";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function emailLayout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a1a1a;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37; letter-spacing: 0.1em;">CAPITAL ACCESS PROGRAM</p>
  </div>
  <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">This is an automated message from SBDV Capital Access. Do not reply directly to this email.</p>
</body>
</html>`;
}

export async function sendCapitalAccessSubmissionEmails(params: {
  applicationId: string;
  borrowerEmail: string;
  borrowerName: string | null;
  companyName: string;
  poolCountry: string;
  poolCategory: string;
  requestedAmountUsd: number;
  interestRatePct: number;
  termYears: number;
  securityDepositUsd: number;
  repaymentFrequency: string;
}) {
  const poolLabel = getPoolTeaser(params.poolCountry, params.poolCategory).label;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ref = params.applicationId.slice(-8).toUpperCase();

  await sendEmail({
    to: params.borrowerEmail,
    subject: `Capital Access Application Received — Ref ${ref}`,
    html: emailLayout(
      "Your application has been received",
      `
      <p>Dear ${params.borrowerName || "Capital Partner"},</p>
      <p>Thank you for submitting your capital access request for <strong>${params.companyName}</strong>. Your application is now in our institutional review queue.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0;"><strong>${ref}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Capital Pool</td><td style="padding: 8px 0;">${poolLabel}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Requested Amount</td><td style="padding: 8px 0;">${formatUsd(params.requestedAmountUsd)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Term</td><td style="padding: 8px 0;">${params.termYears} year(s)</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Interest Rate</td><td style="padding: 8px 0;">${params.interestRatePct}% APR</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Security Deposit</td><td style="padding: 8px 0;">${formatUsd(params.securityDepositUsd)} (10%)</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Repayment</td><td style="padding: 8px 0;">${params.repaymentFrequency === "MONTHLY" ? "Monthly" : "Yearly"}</td></tr>
      </table>
      <p><strong>What happens next:</strong></p>
      <ol style="padding-left: 20px;">
        <li>Our institutional review team will verify your company profile and financials.</li>
        <li>You will receive an email when a decision is made (typically within 5–10 business days).</li>
        <li>Track your application status in the <a href="${siteUrl}/en/capital-access/portal/applications" style="color: #D4AF37;">Capital Access Portal</a>.</li>
      </ol>
      `
    ),
    text: `Your capital access application (Ref ${ref}) for ${params.companyName} has been received and is under review.`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[Action Required] New Capital Access Application — ${params.companyName}`,
    html: emailLayout(
      "New capital access application",
      `
      <p>A new enterprise capital request requires your review.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0;"><strong>${ref}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${params.companyName}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Applicant</td><td style="padding: 8px 0;">${params.borrowerName || params.borrowerEmail} (${params.borrowerEmail})</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Pool</td><td style="padding: 8px 0;">${poolLabel}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0;">${formatUsd(params.requestedAmountUsd)}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">APR</td><td style="padding: 8px 0;">${params.interestRatePct}%</td></tr>
      </table>
      <p><a href="${siteUrl}/en/admin/capital-access" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Review in Admin Panel</a></p>
      `
    ),
    text: `New capital access application from ${params.companyName}. Review at ${siteUrl}/en/admin/capital-access`,
  });
}

export async function sendCapitalAccessDecisionEmail(params: {
  borrowerEmail: string;
  borrowerName: string | null;
  companyName: string;
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  requestedAmountUsd: number;
  securityDepositUsd: number;
  applicationId: string;
}) {
  const ref = params.applicationId.slice(-8).toUpperCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (params.status === "UNDER_REVIEW") {
    await sendEmail({
      to: params.borrowerEmail,
      subject: `Application Under Review — Ref ${ref}`,
      html: emailLayout(
        "Your application is under review",
        `
        <p>Dear ${params.borrowerName || "Capital Partner"},</p>
        <p>Your capital access application for <strong>${params.companyName}</strong> (Ref ${ref}) has moved to active institutional review.</p>
        <p>Our team is currently verifying your financials and investment thesis. No action is required from you at this time.</p>
        <p>Track status: <a href="${siteUrl}/en/capital-access/portal/applications" style="color: #D4AF37;">Capital Access Portal</a></p>
        `
      ),
    });
    return;
  }

  if (params.status === "APPROVED") {
    await sendEmail({
      to: params.borrowerEmail,
      subject: `Application Approved — Ref ${ref}`,
      html: emailLayout(
        "Congratulations — your application is approved",
        `
        <p>Dear ${params.borrowerName || "Capital Partner"},</p>
        <p>We are pleased to inform you that your capital access request for <strong>${params.companyName}</strong> has been <strong style="color: #2d6a4f;">approved</strong>.</p>
        <p><strong>Approved facility:</strong> ${formatUsd(params.requestedAmountUsd)}</p>
        <p><strong>Next steps:</strong></p>
        <ol style="padding-left: 20px;">
          <li><strong>Security deposit:</strong> Transfer ${formatUsd(params.securityDepositUsd)} (10%) to the designated escrow account. Instructions will follow from your relationship manager.</li>
          <li><strong>Documentation:</strong> Submit final audited financials and signed facility agreement within 14 business days.</li>
          <li><strong>Disbursement:</strong> Upon deposit confirmation and KYC completion, funds will be released per your approved investment mandate.</li>
          <li><strong>Contact:</strong> A dedicated relationship manager will reach out within 2 business days.</li>
        </ol>
        <p><a href="${siteUrl}/en/capital-access/portal/applications" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">View Application</a></p>
        `
      ),
      text: `Your capital access application (Ref ${ref}) has been approved. Next: pay security deposit of ${formatUsd(params.securityDepositUsd)}.`,
    });
    return;
  }

  if (params.status === "REJECTED") {
    await sendEmail({
      to: params.borrowerEmail,
      subject: `Application Decision — Ref ${ref}`,
      html: emailLayout(
        "Application decision",
        `
        <p>Dear ${params.borrowerName || "Capital Partner"},</p>
        <p>After careful institutional review, we regret to inform you that your capital access request for <strong>${params.companyName}</strong> (Ref ${ref}) has not been approved at this time.</p>
        <p><strong>Next steps:</strong></p>
        <ol style="padding-left: 20px;">
          <li>You may address the review feedback and submit a revised application after 90 days.</li>
          <li>Consider exploring alternative capital pools that may better align with your investment thesis.</li>
          <li>Contact our capital access desk at <a href="mailto:capital@sbdv.swiss" style="color: #D4AF37;">capital@sbdv.swiss</a> for clarification.</li>
        </ol>
        <p><a href="${siteUrl}/en/capital-access/portal/pools" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none;">Explore Other Pools</a></p>
        `
      ),
      text: `Your capital access application (Ref ${ref}) was not approved. You may reapply after 90 days.`,
    });
  }
}
