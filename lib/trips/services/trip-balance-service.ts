import { prisma } from "@/lib/prisma";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";

/**
 * Returns every currency balance currently available inside a trip.
 */
export async function getTripBalances(
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

        accounts: {
          orderBy: {
            currencyCode: "asc",
          },

          select: {
            id: true,
            currencyCode: true,
            currentBalance: true,
            updatedAt: true,
          },
        },
      },
    });

  if (!tripSettings) {
    throw new TripDomainError(
      "TRIP_NOT_FOUND",
      "El viaje todavía no tiene una configuración financiera.",
      404,
    );
  }

  return {
    baseCurrencyCode:
      tripSettings.baseCurrencyCode,

    accounts: tripSettings.accounts,
  };
}