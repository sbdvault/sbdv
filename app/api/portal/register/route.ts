import { prisma } from "@/lib/prisma";
import { isSanctionedCountry } from "@/lib/countries";
import { sendNotifications } from "@/lib/email";
import { sendWealthSelfRegisterEmails } from "@/lib/client-portal-emails";
import { ensureWealthMandate } from "@/lib/wealth-mandate";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, country, phone } = body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !country ||
      !String(phone ?? "").trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isSanctionedCountry(country)) {
      return NextResponse.json(
        {
          error:
            "SBDV cannot onboard applicants in comprehensively sanctioned jurisdictions.",
        },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash,
        role: "CLIENT",
        clientProfile: {
          create: {
            tier: "standard",
            country: String(country),
            phone: String(phone).trim(),
          },
        },
      },
      include: { clientProfile: true },
    });

    if (user.clientProfile) {
      await ensureWealthMandate(user.clientProfile.id);
    }

    await sendNotifications([
      sendWealthSelfRegisterEmails({
        email: user.email,
        name: user.name,
        country: String(country),
        phone: String(phone).trim(),
      }),
    ]);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/portal/register:", err);
    return NextResponse.json(
      { error: "Unable to create account. Please try again shortly." },
      { status: 500 }
    );
  }
}
