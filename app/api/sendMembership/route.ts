import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country, assetRange, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !country || !assetRange || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to database
    try {
      await prisma.membershipApplication.create({
        data: { name, email, phone, country, assetRange, message },
      });
    } catch (dbError) {
      console.error("Failed to save membership application to database:", dbError);
    }

    // Get Telegram bot credentials from environment variables
    // Support multiple Telegram bots with their own tokens and chat IDs
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

    if (telegramConfigs.length === 0) {
      console.error("Telegram bot credentials not configured");
      // In development, log the inquiry instead of failing
      if (process.env.NODE_ENV === "development") {
        console.log("Membership Application received (Telegram not configured):", {
          name,
          email,
          phone,
          country,
          assetRange,
          message,
        });
        return NextResponse.json(
          { success: true, message: "Application logged (Telegram not configured)" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 }
      );
    }

    // Format message for Telegram
    const telegramMessage = `🔔 New SBDV Membership Application

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone}
🌍 Country: ${country}
💰 Asset Range: ${assetRange}

💬 Message:
${message}

---
Sent via SBDV Membership Form`;

    // Send to all Telegram configurations (each with its own token and chat ID)
    const sendPromises = telegramConfigs.map(async ({ token, chatId }) => {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        }
      );

      if (!telegramResponse.ok) {
        const errorData = await telegramResponse.json();
        console.error(`Telegram API error for chat ${chatId}:`, errorData);
        throw new Error(`Failed to send to chat ${chatId}`);
      }

      return telegramResponse.json();
    });

    // Wait for all messages to be sent
    try {
      await Promise.all(sendPromises);
    } catch (error) {
      console.error("Error sending to one or more Telegram chats:", error);
      // Continue even if one fails - at least one should succeed
    }

    return NextResponse.json(
      { success: true, message: "Membership application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing membership application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

