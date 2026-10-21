import { auth } from "@/auth";
import { isAccountHolder } from "@/lib/admin-host";
import { prisma } from "@/lib/prisma";
import { loadMandateForProfile } from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

export async function requireSignedIn() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function requireAccountHolder() {
  const result = await requireAdminSession();
  if (result.error) return result;
  if (!isAccountHolder(result.session.user.email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return result;
}

export async function mandateForUserId(userId: string) {
  const profile = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  return loadMandateForProfile(profile.id);
}
