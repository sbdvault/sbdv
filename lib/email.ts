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

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const from = process.env.EMAIL_FROM || "SBDV <sbdvault@gmail.com>";

  if (!isEmailConfigured()) {
    console.log("\n--- EMAIL (dev mode — SMTP not configured) ---");
    console.log(`To: ${options.to}`);
    if (options.replyTo) console.log(`Reply-To: ${options.replyTo}`);
    console.log(`Subject: ${options.subject}`);
    console.log(options.text || options.html.replace(/<[^>]+>/g, " "));
    console.log("--- END EMAIL ---\n");
    return true;
  }

  try {
    await getTransporter().sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });
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
