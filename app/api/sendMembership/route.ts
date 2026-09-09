import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMembershipApplicationEmails } from "@/lib/membership-emails";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country, assetRange, message } = body;

    if (!name || !email || !phone || !country || !assetRange || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    try {
      await prisma.membershipApplication.create({
        data: { name, email, phone, country, assetRange, message },
      });
    } catch (dbError) {
      console.error("Failed to save membership application to database:", dbError);
    }

    const emailed = await sendMembershipApplicationEmails({
      name,
      email,
      phone,
      country,
      assetRange,
      message,
    }).then(() => true).catch((err) => {
      console.error("Membership email failed:", err);
      return false;
    });

    const telegramConfigs = [
      { token: process.env.TELEGRAM_CHAT_1_TOKEN, chatId: process.env.TELEGRAM_CHAT_1_ID },
      { token: process.env.TELEGRAM_CHAT_2_TOKEN, chatId: process.env.TELEGRAM_CHAT_2_ID },
    ].filter((config) => config.token && config.chatId);

    if (telegramConfigs.length > 0) {
      const telegramMessage = `New SBDV Membership Application

Name: ${name}
Email: ${email}
Phone: ${phone}
Country: ${country}
Asset Range: ${assetRange}

Message:
${message}

---
Sent via SBDV Membership Form`;

      await Promise.allSettled(
        telegramConfigs.map(async ({ token, chatId }) => {
          const telegramResponse = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: telegramMessage }),
            }
          );
          if (!telegramResponse.ok) {
            console.error(`Telegram API error for chat ${chatId}:`, await telegramResponse.json());
          }
        })
      );
    }

    if (!emailed && telegramConfigs.length === 0) {
      return NextResponse.json(
        { error: "Could not deliver membership application notification" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Membership application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing membership application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
