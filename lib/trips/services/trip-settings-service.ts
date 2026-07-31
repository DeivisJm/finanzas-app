import { ProjectType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import type { ConfigureTripInput } from "@/lib/trips/services/trip-service.types";
import { normalizeCurrencyCode } from "@/lib/trips/utils/currency";

export async function configureTrip(input: ConfigureTripInput) {
  const baseCurrencyCode = normalizeCurrencyCode(
    input.baseCurrencyCode,
  );

  return prisma.$transaction(async (transaction) => {
    const folder = await transaction.folder.findUnique({
      where: {
        id: input.folderId,
      },
      include: {
        project: {
          select: {
            id: true,
            type: true,
          },
        },
        tripSettings: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!folder) {
      throw new TripDomainError(
        "TRIP_NOT_FOUND",
        "No se encontró la carpeta del viaje.",
        404,
      );
    }

    if (folder.project.type !== ProjectType.TRIP) {
      throw new TripDomainError(
        "PROJECT_NOT_TRIP",
        "La carpeta indicada no pertenece a un proyecto de viajes.",
      );
    }

    if (folder.tripSettings) {
      throw new TripDomainError(
        "TRIP_ALREADY_CONFIGURED",
        "Este viaje ya tiene una configuración financiera.",
        409,
      );
    }

    return transaction.tripSettings.create({
      data: {
        folderId: folder.id,
        baseCurrencyCode,
        accounts: {
          create: {
            currencyCode: baseCurrencyCode,
            currentBalance: 0,
          },
        },
      },
      include: {
        accounts: {
          orderBy: {
            currencyCode: "asc",
          },
        },
      },
    });
  });
}

export async function getTripSettingsByFolderId(folderId: number) {
  const tripSettings = await prisma.tripSettings.findUnique({
    where: {
      folderId,
    },
    include: {
      folder: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
      accounts: {
        orderBy: {
          currencyCode: "asc",
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

  return tripSettings;
}