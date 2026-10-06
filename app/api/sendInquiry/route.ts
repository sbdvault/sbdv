import { NextRequest, NextResponse } from "next/server";
import { sendContactInquiryEmail } from "@/lib/contact-emails";

async function sendTelegramMirrors(payload: {
  name: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  message: string;
}): Promise<number> {
  const telegramConfigs = [
    {
      token: process.env.TELEGRAM_CHAT_1_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_1_ID,
    },
    {
      token: process.env.TELEGRAM_CHAT_2_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_2_ID,
    },
  ].filter((config) => config.token && config.chatId);

  if (telegramConfigs.length === 0) return 0;

  const telegramMessage = `🔔 New SBDV Inquiry

👤 Name: ${payload.name}
📧 Email: ${payload.email}
📞 Phone: ${payload.phone}
🌍 Country: ${payload.country}
💼 Investment Interest: ${payload.interest}

💬 Message:
${payload.message}

---
Sent via SBDV Contact Form`;

  const results = await Promise.allSettled(
    telegramConfigs.map(async ({ token, chatId }) => {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
          }),
        }
      );
      if (!telegramResponse.ok) {
        const errorData = await telegramResponse.json().catch(() => ({}));
        console.error(`Telegram API error for chat ${chatId}:`, errorData);
        throw new Error(`Telegram failed for ${chatId}`);
      }
    })
  );

  return results.filter((r) => r.status === "fulfilled").length;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country, interest, message } = body;

    if (!name || !email || !phone || !country || !interest || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      country: String(country).trim(),
      interest: String(interest).trim(),
      message: String(message).trim(),
    };

    const emailSent = await sendContactInquiryEmail(payload);
    const telegramSent = await sendTelegramMirrors(payload);

    if (!emailSent && telegramSent === 0) {
      return NextResponse.json(
        {
          error:
            "Could not deliver inquiry. Gmail SMTP rejected the login — use a Google App Password in SMTP_PASS, or configure Telegram.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully",
        channels: {
          email: emailSent,
          telegram: telegramSent > 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
