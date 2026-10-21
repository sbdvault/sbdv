import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/wealth-access";
import {
  ensureWealthMandate,
  loadPaymentProofsForProfiles,
  serializeMandate,
} from "@/lib/wealth-mandate";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdminSession();
  if ("error" in gate) return gate.error;

  const profiles = await prisma.clientProfile.findMany({
    include: { user: true, wealthMandate: true },
  });
  for (const profile of profiles) {
    if (!profile.wealthMandate && profile.user.role === "CLIENT") {
      await ensureWealthMandate(profile.id);
    }
  }

  const mandates = await prisma.wealthMandate.findMany({
    include: {
      entries: true,
      clientProfile: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const proofsByProfile = await loadPaymentProofsForProfiles(
    mandates.map((mandate) => mandate.clientProfileId)
  );

  return NextResponse.json({
    mandates: mandates.map((mandate) => ({
      client: mandate.clientProfile.user,
      ...serializeMandate(
        mandate,
        new Date(),
        proofsByProfile.get(mandate.clientProfileId) || []
      ),
    })),
  });
}
