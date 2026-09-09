import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * While using Resend's onboarding@resend.dev sender, delivery is limited to the
 * Resend account owner. Set EMAIL_REDIRECT_TO to that address for local/QA so
 * every transactional email is still receivable (original recipient is noted).
 * Leave unset in production once a domain is verified.
 */
function resolveRecipient(to: string): { to: string; subjectPrefix: string; noteHtml: string; noteText: string } {
  const redirect = process.env.EMAIL_REDIRECT_TO?.trim();
  if (!redirect || redirect.toLowerCase() === to.toLowerCase()) {
    return { to, subjectPrefix: "", noteHtml: "", noteText: "" };
  }
  return {
    to: redirect,
    subjectPrefix: `[originally to: ${to}] `,
    noteHtml: `<p style="font-size:12px;color:#888;background:#f7f5f0;padding:12px;border-left:3px solid #D4AF37;"><strong>Dev redirect:</strong> This message was intended for <code>${to}</code>.</p>`,
    noteText: `[Dev redirect] Intended for: ${to}\n\n`,
  };
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const from = process.env.EMAIL_FROM || "SBDV <onboarding@resend.dev>";
  const routed = resolveRecipient(options.to);
  const subject = `${routed.subjectPrefix}${options.subject}`;
  const html = routed.noteHtml ? `${routed.noteHtml}${options.html}` : options.html;
  const text = routed.noteText
    ? `${routed.noteText}${options.text || ""}`
    : options.text;

  if (!isEmailConfigured()) {
    console.log("\n--- EMAIL (dev mode — SMTP not configured) ---");
    console.log(`To: ${routed.to}${routed.to !== options.to ? ` (was ${options.to})` : ""}`);
    if (options.replyTo) console.log(`Reply-To: ${options.replyTo}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html.replace(/<[^>]+>/g, " "));
    console.log("--- END EMAIL ---\n");
    return true;
  }

  try {
    await getTransporter().sendMail({
      from,
      to: routed.to,
      subject,
      html,
      text,
      replyTo: options.replyTo,
    });
    if (routed.to !== options.to) {
      console.log(`Email redirected: ${options.to} → ${routed.to} (${options.subject})`);
    }
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

export async function getAdminEmail(): Promise<string> {
  return process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || "sbdvault@gmail.com";
}

/** Inbox for Contact / Private Inquiry form submissions */
export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL || "sbdvault@gmail.com";
}
