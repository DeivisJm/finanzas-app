import { Prisma } from "@prisma/client";

import { allocateLotsFifo } from "@/lib/trips/engine/fifo-engine";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import type { PreviewTripPriceInput } from "@/lib/trips/services/trip-service.types";
import { normalizeCurrencyCode } from "@/lib/trips/utils/currency";
import {
  roundMoney,
  toPositiveDecimal,
} from "@/lib/trips/utils/decimal";
import { prisma } from "@/lib/prisma";

interface IntermediateEquivalent {
  currencyCode: string;
  amount: Prisma.Decimal;
}

/**
 * Calculates the real equivalent value of a quoted price without
 * consuming balances or creating financial records.
 */
export async function previewTripPrice(
  input: PreviewTripPriceInput,
) {
  const currencyCode = normalizeCurrencyCode(
    input.currencyCode,
  );

  const amount = roundMoney(
    toPositiveDecimal(
      input.amount,
      "monto a consultar",
    ),
  );

  const tripSettings =
    await prisma.tripSettings.findUnique({
      where: {
        folderId: input.folderId,
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

  const account =
    await prisma.tripCurrencyAccount.findUnique({
      where: {
        tripSettingsId_currencyCode: {
          tripSettingsId: tripSettings.id,
          currencyCode,
        },
      },
    });

  if (!account) {
    throw new TripDomainError(
      "ACCOUNT_NOT_FOUND",
      `Todavía no existe una conversión registrada para ${currencyCode}.`,
      404,
    );
  }

  /*
   * The consultation uses the same FIFO order as a real purchase,
   * but no database record or balance is modified.
   */
  const lots = await prisma.currencyLot.findMany({
    where: {
      accountId: account.id,

      remainingAmount: {
        gt: 0,
      },
    },

    orderBy: [
      {
        createdAt: "asc",
      },
      {
        id: "asc",
      },
    ],

    include: {
      conversion: {
        select: {
          fromAmount: true,
          toAmount: true,

          fromAccount: {
            select: {
              currencyCode: true,
            },
          },
        },
      },
    },
  });

  const fifoResult = allocateLotsFifo(
    lots,
    amount,
  );

  /*
   * A destination currency may have been created from more than one
   * intermediate currency. We therefore aggregate equivalents by code
   * instead of assuming USD or any other fixed currency.
   */
  const intermediateTotals =
    new Map<string, Prisma.Decimal>();

  for (const allocation of fifoResult.allocations) {
    const lot = lots.find(
      (currentLot) =>
        currentLot.id === allocation.lotId,
    );

    if (!lot?.conversion) {
      continue;
    }

    const sourceCurrencyCode =
      lot.conversion.fromAccount.currencyCode;

    /*
     * The base currency is already returned separately, so it is not
     * duplicated as an intermediate equivalent.
     */
    if (
      sourceCurrencyCode ===
      tripSettings.baseCurrencyCode
    ) {
      continue;
    }

    const sourcePerDestinationUnit =
      lot.conversion.fromAmount.dividedBy(
        lot.conversion.toAmount,
      );

    const equivalentAmount = roundMoney(
      allocation.allocatedAmount.mul(
        sourcePerDestinationUnit,
      ),
    );

    const currentAmount =
      intermediateTotals.get(
        sourceCurrencyCode,
      ) ?? new Prisma.Decimal(0);

    intermediateTotals.set(
      sourceCurrencyCode,
      roundMoney(
        currentAmount.add(equivalentAmount),
      ),
    );
  }

  const intermediateEquivalents:
    IntermediateEquivalent[] = Array.from(
      intermediateTotals.entries(),
    ).map(
      ([currentCurrencyCode, currentAmount]) => ({
        currencyCode: currentCurrencyCode,
        amount: currentAmount,
      }),
    );

  return {
    quotedCurrencyCode: currencyCode,
    quotedAmount: amount,

    baseCurrencyCode:
      tripSettings.baseCurrencyCode,

    equivalentBaseAmount:
      fifoResult.totalBaseAmount,

    intermediateEquivalents,
  };
}