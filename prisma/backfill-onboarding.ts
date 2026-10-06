import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.capitalAccessRequest.updateMany({
    where: { status: "APPROVED", onboardingPhase: null },
    data: {
      onboardingPhase: "AWAITING_DEPOSIT",
      relationshipManager: "Capital Access Desk",
    },
  });
  console.log("Backfilled approved applications:", updated.count);

  const all = await prisma.capitalAccessRequest.findMany({
    select: { companyName: true, status: true, onboardingPhase: true },
  });
  console.log(all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
