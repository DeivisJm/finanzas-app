import { prisma } from "@/lib/prisma";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";

/**
 * Returns every travel expense belonging to a folder,
 * including its FIFO traceability information.
 */
export async function getTripExpenses(
  folderId: number,
) {
  const tripSettings =
    await prisma.tripSettings.findUnique({
      where: {
        folderId,
      },

      select: {
        id: true,
        baseCurrencyCode: true,
      },
    });

  if (!tripSettings) {
    throw new TripDomainError(
      "TRIP_NOT_FOUND",
      "El viaje todavía no tiene una configuración financiera.",
      404,
    );
  }

  const expenses =
    await prisma.tripExpense.findMany({
      where: {
        tripSettingsId: tripSettings.id,
      },

      orderBy: [
        {
          expenseDate: "desc",
        },
        {
          id: "desc",
        },
      ],

      include: {
        allocations: {
          include: {
            sourceLot: {
              select: {
                id: true,
                sourceType: true,
                unitCostInBaseCurrency: true,
              },
            },
          },
        },
      },
    });

  return {
    baseCurrencyCode:
      tripSettings.baseCurrencyCode,

    expenses,
  };
}