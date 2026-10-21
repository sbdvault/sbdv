import { sendEmail, getAdminEmail, type SendEmailAttachment } from "@/lib/email";
import { foundingBonusPct, foundingClientCap } from "@/lib/wealth-mandate";
import { getFileExtension } from "@/lib/upload-validation";
import { readFile } from "fs/promises";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function layout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; color: #1a1a1a;">Swiss Bullion Depository Vault</h1>
    <p style="margin: 4px 0 0; font-size: 12px; color: #D4AF37; letter-spacing: 0.1em;">WEALTH MANDATE</p>
  </div>
  <h2 style="font-size: 18px; margin-top: 0;">${title}</h2>
  ${body}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
  <p style="font-size: 11px; color: #888;">Mandate yield is not a bank deposit. Bitcoin transfers are irreversible. Automated message from SBDV.</p>
</body>
</html>`;
}

function methodLabel(method: string) {
  return method === "DEPOSIT_BTC" ? "Bitcoin transfer" : "wire transfer";
}

function loginButton() {
  return `<p><a href="${siteUrl()}/en/login" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Log in to your account</a></p>`;
}

function adminButton() {
  return `<p><a href="${siteUrl()}/en/admin/wealth-mandates" style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #1a1a1a; text-decoration: none; font-weight: bold;">Open Wealth Mandates</a></p>`;
}

function contentTypeFor(name: string) {
  const ext = getFileExtension(name);
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

async function proofAttachments(
  filePath: string | null | undefined,
  filename: string | null | undefined
): Promise<{ attachments: SendEmailAttachment[]; previewHtml: string }> {
  if (!filePath || !filename) {
    return { attachments: [], previewHtml: "<p>No payment attachment was stored on the server.</p>" };
  }
  try {
    const content = await readFile(filePath);
    const contentType = contentTypeFor(filename);
    const isJpeg = contentType === "image/jpeg";
    const attachments: SendEmailAttachment[] = [
      {
        filename,
        content,
        contentType,
        cid: isJpeg ? "payment-proof" : undefined,
      },
    ];
    const previewHtml = isJpeg
      ? `<p>Payment attachment:</p><p><img src="cid:payment-proof" alt="Payment proof" style="max-width:100%;border:1px solid #eee;" /></p>`
      : `<p>Payment attachment <strong>${filename}</strong> is attached to this message.</p>`;
    return { attachments, previewHtml };
  } catch {
    return {
      attachments: [],
      previewHtml: `<p>Payment file <strong>${filename}</strong> was recorded but could not be attached.</p>`,
    };
  }
}

export async function sendWealthFundingNoticeEmails(params: {
  email: string;
  name: string | null;
  amountUsd: number;
  method: string;
  reference: string;
}) {
  const rail = methodLabel(params.method);
  await sendEmail({
    to: params.email,
    subject: "SBDV — Funding notice received",
    html: layout(
      "We received your funding notice",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Operations has your ${rail} notice for <strong>${formatUsd(params.amountUsd)}</strong>.</p>
      <p>Reference: <code>${params.reference}</code></p>
      <p>House instructions will appear in your portal after this notice is approved. Do not send funds until you log in and see those instructions.</p>
      ${loginButton()}
      `
    ),
    text: `Funding notice received for ${formatUsd(params.amountUsd)} via ${rail}. Reference ${params.reference}. Log in after approval to follow portal instructions.`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Mandate funding pending — ${params.name || params.email}`,
    html: layout(
      "Client funding awaits approval",
      `
      <p><strong>${params.name || "—"}</strong> &lt;${params.email}&gt; submitted a ${rail} funding of ${formatUsd(params.amountUsd)}.</p>
      <p>Reference: <code>${params.reference}</code></p>
      <p>Approve the notice in Admin → Wealth Mandates so matching house instructions appear on the client portal. The client is not emailed coordinates.</p>
      ${adminButton()}
      `
    ),
    text: `Pending ${params.method} funding ${formatUsd(params.amountUsd)} from ${params.email}. Ref ${params.reference}. Approve to release portal instructions.`,
  });
}

export async function sendWealthInstructionsReadyEmails(params: {
  email: string;
  name: string | null;
  amountUsd: number;
  method: string;
  reference: string;
}) {
  await sendEmail({
    to: params.email,
    subject: "SBDV — Action on your funding notice",
    html: layout(
      "Log in and follow the instruction",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Action has been taken on your ${methodLabel(params.method)} notice for <strong>${formatUsd(params.amountUsd)}</strong> (reference <code>${params.reference}</code>).</p>
      <p>Log into your account and follow the instruction on Funding. Transfer only to the coordinates shown in the portal, then upload payment proof.</p>
      ${loginButton()}
      `
    ),
    text: `Action has been taken on your funding notice (${params.reference}). Log into your account and follow the instruction on Funding.`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Funding notice approved — ${params.name || params.email}`,
    html: layout(
      "Client asked to log in",
      `
      <p>The ${methodLabel(params.method)} notice from <strong>${params.name || "—"}</strong> &lt;${params.email}&gt; for ${formatUsd(params.amountUsd)} was approved.</p>
      <p>Reference: <code>${params.reference}</code></p>
      <p>Matching house instructions are now visible on the client portal. The client was asked to log in and follow them — coordinates were not emailed.</p>
      ${adminButton()}
      `
    ),
    text: `Approved ${params.method} notice ${params.reference} for ${params.email}. Client nudged to log in; instructions are on the portal only.`,
  });
}

export async function sendWealthProofUploadedEmails(params: {
  email: string;
  name: string | null;
  amountUsd: number;
  method: string;
  reference: string;
  filename: string;
  filePath: string;
}) {
  await sendEmail({
    to: params.email,
    subject: "SBDV — Payment information received",
    html: layout(
      "We received your payment information",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Your payment attachment <strong>${params.filename}</strong> for ${formatUsd(params.amountUsd)} (${params.reference}) is with operations. Principal is credited only after receipt is confirmed.</p>
      ${loginButton()}
      `
    ),
    text: `We received your payment information (${params.filename}) for ${params.reference}.`,
  });

  const { attachments, previewHtml } = await proofAttachments(params.filePath, params.filename);
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Payment proof uploaded — ${params.name || params.email}`,
    html: layout(
      "Client uploaded payment information",
      `
      <p><strong>${params.name || "—"}</strong> &lt;${params.email}&gt; uploaded payment proof for a ${methodLabel(params.method)} of ${formatUsd(params.amountUsd)}.</p>
      <p>Reference: <code>${params.reference}</code></p>
      ${previewHtml}
      <p>Confirm receipt in Admin → Wealth Mandates after the transfer is verified.</p>
      ${adminButton()}
      `
    ),
    text: `${params.email} uploaded ${params.filename} for ${params.reference} (${formatUsd(params.amountUsd)}).`,
    attachments,
  });
}

export async function sendWealthDepositRejectedEmails(params: {
  email: string;
  name: string | null;
  amountUsd: number;
  method: string;
  reference: string | null;
  adminNote: string | null;
}) {
  const note = params.adminNote
    ? `<p>Note from operations: ${params.adminNote}</p>`
    : "";
  await sendEmail({
    to: params.email,
    subject: "SBDV — Funding notice not accepted",
    html: layout(
      "This funding notice was not accepted",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Your ${methodLabel(params.method)} notice for ${formatUsd(params.amountUsd)}${params.reference ? ` (reference <code>${params.reference}</code>)` : ""} was not accepted.</p>
      ${note}
      <p>You may submit a new notice from Funding after you log in.</p>
      ${loginButton()}
      `
    ),
    text: `Your funding notice${params.reference ? ` ${params.reference}` : ""} was not accepted.`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Funding notice rejected — ${params.name || params.email}`,
    html: layout(
      "Funding notice rejected",
      `
      <p>The ${methodLabel(params.method)} notice from <strong>${params.name || "—"}</strong> &lt;${params.email}&gt; for ${formatUsd(params.amountUsd)} was rejected.</p>
      ${params.reference ? `<p>Reference: <code>${params.reference}</code></p>` : ""}
      ${note}
      ${adminButton()}
      `
    ),
    text: `Rejected ${params.method} notice ${params.reference || ""} for ${params.email}.`,
  });
}

export async function sendWealthFundingConfirmedEmails(params: {
  email: string;
  name: string | null;
  amountUsd: number;
  method: string;
  bonusUsd?: number;
}) {
  const rail = methodLabel(params.method);
  const bonusLine =
    params.bonusUsd && params.bonusUsd > 0
      ? `<p>As one of the first ${foundingClientCap()} funded clients, a founding bonus of <strong>${formatUsd(params.bonusUsd)}</strong> (${foundingBonusPct()}%) has been added to principal.</p>`
      : "";
  const bonusText =
    params.bonusUsd && params.bonusUsd > 0
      ? ` Founding bonus ${formatUsd(params.bonusUsd)} added to principal.`
      : "";

  await sendEmail({
    to: params.email,
    subject: "SBDV — Mandate funding confirmed",
    html: layout(
      "Funding credited to your mandate",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>We have confirmed receipt of your ${rail}. <strong>${formatUsd(params.amountUsd)}</strong> has been credited as principal on your private-client wealth mandate.</p>
      ${bonusLine}
      <p>Stated mandate yield now accrues on this principal. You can monitor live balances, withdraw accrued interest, or reinvest interest in your portal.</p>
      ${loginButton()}
      `
    ),
    text: `Funding of ${formatUsd(params.amountUsd)} via ${rail} was credited as mandate principal.${bonusText}`,
  });

  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[SBDV] Mandate funding confirmed — ${params.name || params.email}`,
    html: layout(
      "Principal credited",
      `
      <p>Receipt confirmed for <strong>${params.name || "—"}</strong> &lt;${params.email}&gt;: ${formatUsd(params.amountUsd)} via ${rail}.</p>
      ${bonusLine}
      ${adminButton()}
      `
    ),
    text: `Confirmed ${params.method} ${formatUsd(params.amountUsd)} for ${params.email}.${bonusText}`,
  });
}

export async function sendWealthInterestPaidEmail(params: {
  email: string;
  name: string | null;
  amountUsd: number;
}) {
  await sendEmail({
    to: params.email,
    subject: "SBDV — Interest withdrawal paid",
    html: layout(
      "Interest payout completed",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p>Your request to withdraw accrued mandate interest of <strong>${formatUsd(params.amountUsd)}</strong> has been paid. Principal remains invested under the mandate.</p>
      `
    ),
    text: `Interest withdrawal of ${formatUsd(params.amountUsd)} has been paid. Principal remains invested.`,
  });
}

export async function sendWealthInterestReinvestedEmail(params: {
  email: string;
  name: string | null;
  amountUsd: number;
}) {
  await sendEmail({
    to: params.email,
    subject: "SBDV — Interest reinvested into principal",
    html: layout(
      "Interest compounded into principal",
      `
      <p>Dear ${params.name || "Client"},</p>
      <p><strong>${formatUsd(params.amountUsd)}</strong> of accrued interest has been reinvested as principal. Future mandate yield will accrue on the new principal balance.</p>
      `
    ),
    text: `${formatUsd(params.amountUsd)} of accrued interest was reinvested as principal.`,
  });
}

