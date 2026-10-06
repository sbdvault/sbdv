import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPortalMessageNotifyEmail } from "@/lib/client-portal-emails";
import { sendNotifications } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, receiverId } = await request.json();

  if (!subject || !body) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  let targetReceiverId = receiverId;
  if (!targetReceiverId) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No advisor available" }, { status: 404 });
    }
    targetReceiverId = admin.id;
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId: targetReceiverId,
      subject,
      body,
      encrypted: true,
    },
  });

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true },
    }),
    prisma.user.findUnique({
      where: { id: targetReceiverId },
      select: { email: true, name: true, role: true },
    }),
  ]);

  if (receiver?.email) {
    const portalHref =
      receiver.role === "ADMIN"
        ? "/en/admin"
        : receiver.role === "BORROWER"
          ? "/en/capital-access/portal"
          : "/en/portal/messages";

    await sendNotifications([
      sendPortalMessageNotifyEmail({
        toEmail: receiver.email,
        toName: receiver.name,
        fromName: sender?.name || session.user.name || null,
        subject,
        preview: body,
        portalHref,
      }),
    ]);
  }

  return NextResponse.json({ message });
}
