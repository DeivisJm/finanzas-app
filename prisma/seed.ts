import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates the default projects and the initial Davivienda folder.
 */
async function seedDatabase(): Promise<void> {
  const creditCardsProject = await prisma.project.upsert({
    where: {
      slug: "credit-cards",
    },
    update: {
      name: "Tarjetas de crédito",
      description: "Administración de gastos por tarjeta de crédito.",
      color: "#dc2626",
      icon: "credit-card",
      sortOrder: 1,
    },
    create: {
      name: "Tarjetas de crédito",
      slug: "credit-cards",
      description: "Administración de gastos por tarjeta de crédito.",
      color: "#dc2626",
      icon: "credit-card",
      sortOrder: 1,
    },
  });

  await prisma.project.upsert({
    where: {
      slug: "trips",
    },
    update: {
      name: "Viajes",
      description: "Organización de presupuestos y gastos de viajes.",
      color: "#2563eb",
      icon: "plane",
      sortOrder: 2,
    },
    create: {
      name: "Viajes",
      slug: "trips",
      description: "Organización de presupuestos y gastos de viajes.",
      color: "#2563eb",
      icon: "plane",
      sortOrder: 2,
    },
  });

  await prisma.folder.upsert({
    where: {
      projectId_slug: {
        projectId: creditCardsProject.id,
        slug: "davivienda",
      },
    },
    update: {
      name: "Davivienda",
      color: "#dc2626",
      icon: "landmark",
    },
    create: {
      name: "Davivienda",
      slug: "davivienda",
      color: "#dc2626",
      icon: "landmark",
      projectId: creditCardsProject.id,
    },
  });
}

seedDatabase()
  .then(async () => {
    console.log("Database seeded successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Database seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });