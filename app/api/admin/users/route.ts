import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { accountHolderEmail, isAccountHolder } from "@/lib/admin-host";
import { requireAccountHolder } from "@/lib/wealth-access";
import { NextResponse } from "next/server";

function serializeAdmin(user: {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  auditEvents: { createdAt: Date }[];
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    lastSignInAt: user.auditEvents[0]?.createdAt.toISOString() ?? null,
    isAccountHolder: isAccountHolder(user.email),
  };
}

export async function GET() {
  const gate = await requireAccountHolder();
  if (gate.error) return gate.error;

  const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      auditEvents: {
        where: { action: "LOGIN" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users: users.map(serializeAdmin) });
}

export async function POST(request: Request) {
  const gate = await requireAccountHolder();
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (email === accountHolderEmail()) {
    return NextResponse.json(
      { error: "That email belongs to the account holder" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          lastSignInAt: null,
          isAccountHolder: false,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/users:", err);
    return NextResponse.json({ error: "Unable to create administrator" }, { status: 500 });
  }
}
