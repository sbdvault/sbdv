import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { allWealthEntities } from "../lib/wealth-entities";

const prisma = new PrismaClient();

async function seedWealthEntities() {
  await prisma.globalWealthEntity.deleteMany();

  await prisma.globalWealthEntity.createMany({
    data: allWealthEntities.map((entity) => ({
      category: entity.category,
      country: entity.country,
      region: entity.region ?? null,
      name: entity.name,
      vehicleName: entity.vehicleName ?? null,
      aumMinUsd: entity.aumMinUsd,
      aumMaxUsd: entity.aumMaxUsd,
      displayFraction: entity.displayFraction,
      mandate: entity.mandate,
      sortOrder: entity.sortOrder,
    })),
  });

  console.log(`  Seeded ${allWealthEntities.length} global wealth entities`);
}

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const clientPassword = await bcrypt.hash("Client123!", 12);
  const borrowerPassword = await bcrypt.hash("Borrow123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@sbdv.swiss" },
    update: {},
    create: {
      email: "admin@sbdv.swiss",
      name: "SBDV Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "borrower@sbdv.swiss" },
    update: {},
    create: {
      email: "borrower@sbdv.swiss",
      name: "Demo Borrower",
      passwordHash: borrowerPassword,
      role: "BORROWER",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@sbdv.swiss" },
    update: {},
    create: {
      email: "client@sbdv.swiss",
      name: "Demo Client",
      passwordHash: clientPassword,
      role: "CLIENT",
      mfaEnabled: false,
    },
  });

  let profile = await prisma.clientProfile.findUnique({
    where: { userId: client.id },
  });

  if (!profile) {
    profile = await prisma.clientProfile.create({
      data: {
        userId: client.id,
        tier: "executive",
        country: "Switzerland",
        phone: "+41 44 000 0000",
      },
    });
  }

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: { clientProfileId: profile.id },
  });

  if (!existingPortfolio) {
    await prisma.portfolio.create({
      data: {
        clientProfileId: profile.id,
        name: "Primary Portfolio",
        currency: "USD",
        holdings: {
          create: [
            {
              type: "BULLION",
              name: "Gold Bars (LBMA)",
              quantity: 50,
              unit: "oz",
              costBasis: 95000,
              marketValue: 102500,
              purity: "999.9",
              vaultLocation: "Zurich, Switzerland",
              auditStatus: "verified",
            },
            {
              type: "BULLION",
              name: "Silver Bars",
              quantity: 500,
              unit: "oz",
              costBasis: 12000,
              marketValue: 13500,
              purity: "999.0",
              vaultLocation: "Zurich, Switzerland",
              auditStatus: "verified",
            },
            {
              type: "EQUITY",
              name: "Global Equity ETF",
              symbol: "VT",
              quantity: 200,
              costBasis: 22000,
              marketValue: 24800,
            },
            {
              type: "BOND",
              name: "Swiss Government Bonds",
              symbol: "SWISS-BOND",
              quantity: 100,
              costBasis: 98000,
              marketValue: 99500,
            },
            {
              type: "ALTERNATIVE",
              name: "Private Market Fund",
              symbol: "PMF-I",
              quantity: 1,
              costBasis: 75000,
              marketValue: 82000,
            },
          ],
        },
        performance: {
          create: [
            { period: "ytd", returnPct: 8.2, benchmarkPct: 6.5 },
            { period: "1y", returnPct: 12.4, benchmarkPct: 10.1 },
            { period: "3y", returnPct: 28.6, benchmarkPct: 24.2 },
            { period: "all", returnPct: 45.3, benchmarkPct: 38.7 },
          ],
        },
      },
    });
  }

  const docCount = await prisma.document.count({
    where: { clientProfileId: profile.id },
  });

  if (docCount === 0) {
    await prisma.document.createMany({
      data: [
        {
          clientProfileId: profile.id,
          name: "Q4 2025 Portfolio Statement",
          type: "STATEMENT",
          filePath: "seed/q4-statement.pdf",
          fileSize: 245000,
        },
        {
          clientProfileId: profile.id,
          name: "Custody Agreement",
          type: "CONTRACT",
          filePath: "seed/custody-agreement.pdf",
          fileSize: 180000,
        },
      ],
    });
  }

  await seedWealthEntities();

  console.log("Seed completed:");
  console.log("  Admin: admin@sbdv.swiss / Admin123!");
  console.log("  Client: client@sbdv.swiss / Client123!");
  console.log("  Borrower: borrower@sbdv.swiss / Borrow123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
