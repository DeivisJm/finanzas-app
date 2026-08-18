import {
  CurrencyLotSourceType,
  Prisma,
} from "@prisma/client";

import { allocateLotsFifo } from "@/lib/trips/engine/fifo-engine";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import {
  decreaseAccountBalance,
  findTripAccount,
  getOrCreateTripAccount,
  increaseAccountBalance,
} from "@/lib/trips/repositories/account.repository";
import {
  findAvailableLots,
  updateLotRemainingAmount,
} from "@/lib/trips/repositories/lot.repository";
import type { ConvertCurrencyInput } from "@/lib/trips/services/trip-service.types";
import {
  currenciesAreEqual,
  normalizeCurrencyCode,
} from "@/lib/trips/utils/currency";
import {
  roundMoney,
  roundRate,
  toPositiveDecimal,
} from "@/lib/trips/utils/decimal";
import { prisma } from "@/lib/prisma";

/**
 * Converts money between two currencies while preserving the original
 * cost in the trip's base currency through FIFO lot allocation.
 */
export async function convertTripCurrency(
  input: ConvertCurrencyInput,
) {
  const fromCurrencyCode = normalizeCurrencyCode(
    input.fromCurrencyCode,
  );

  const toCurrencyCode = normalizeCurrencyCode(
    input.toCurrencyCode,
  );

  if (
    currenciesAreEqual(
      fromCurrencyCode,
      toCurrencyCode,
    )
  ) {
    throw new TripDomainError(
      "INVALID_CONVERSION",
      "La moneda de origen y la moneda de destino deben ser diferentes.",
    );
  }

  const fromAmount = roundMoney(
    toPositiveDecimal(
      input.fromAmount,
      "monto entregado",
    ),
  );

  const toAmount = roundMoney(
    toPositiveDecimal(
      input.toAmount,
      "monto recibido",
    ),
  );

  const effectiveRate = roundRate(
    toAmount.dividedBy(fromAmount),
  );

  const note = input.note?.trim() || null;

  const conversionDate =
    input.conversionDate ?? new Date();

  return prisma.$transaction(
    async (transaction) => {
      const tripSettings =
        await transaction.tripSettings.findUnique({
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
          "El viaje debe configurarse antes de registrar conversiones.",
          404,
        );
      }

      const fromAccount = await findTripAccount(
        transaction,
        tripSettings.id,
        fromCurrencyCode,
      );

      if (!fromAccount) {
        throw new TripDomainError(
          "ACCOUNT_NOT_FOUND",
          `No existe saldo disponible en ${fromCurrencyCode}.`,
          404,
        );
      }

      if (
        fromAccount.currentBalance.lt(fromAmount)
      ) {
        throw new TripDomainError(
          "INSUFFICIENT_BALANCE",
          `No hay suficiente saldo disponible en ${fromCurrencyCode}.`,
          409,
        );
      }

      const destinationAccount =
        await getOrCreateTripAccount(
          transaction,
          tripSettings.id,
          toCurrencyCode,
        );

      const availableLots =
        await findAvailableLots(
          transaction,
          fromAccount.id,
        );

      const fifoResult = allocateLotsFifo(
        availableLots,
        fromAmount,
      );

      const conversion =
        await transaction.currencyConversion.create({
          data: {
            tripSettingsId: tripSettings.id,
            fromAccountId: fromAccount.id,
            toAccountId: destinationAccount.id,

            fromAmount,
            toAmount,
            effectiveRate,

            feeAmount: null,
            note,
            conversionDate,
          },
        });

      for (const allocation of fifoResult.allocations) {
        await updateLotRemainingAmount(
          transaction,
          allocation.lotId,
          allocation.remainingAmount,
        );

        await transaction.currencyConversionAllocation.create(
          {
            data: {
              conversionId: conversion.id,
              sourceLotId: allocation.lotId,

              allocatedAmount:
                allocation.allocatedAmount,

              allocatedBaseAmount:
                allocation.allocatedBaseAmount,
            },
          },
        );
      }

      await decreaseAccountBalance(
        transaction,
        fromAccount.id,
        fromAmount,
      );

      await increaseAccountBalance(
        transaction,
        destinationAccount.id,
        toAmount,
      );

      const destinationUnitCost =
        roundRate(
          fifoResult.totalBaseAmount.dividedBy(
            toAmount,
          ),
        );

      const destinationLot =
        await transaction.currencyLot.create({
          data: {
            accountId: destinationAccount.id,

            sourceType:
              CurrencyLotSourceType.CONVERSION,

            conversionId: conversion.id,

            originalAmount: toAmount,
            remainingAmount: toAmount,

            unitCostInBaseCurrency:
              destinationUnitCost,
          },
        });

      const updatedSourceAccount =
        await transaction.tripCurrencyAccount.findUniqueOrThrow(
          {
            where: {
              id: fromAccount.id,
            },
          },
        );

      const updatedDestinationAccount =
        await transaction.tripCurrencyAccount.findUniqueOrThrow(
          {
            where: {
              id: destinationAccount.id,
            },
          },
        );

      return {
        conversion,
        sourceAccount: updatedSourceAccount,
        destinationAccount:
          updatedDestinationAccount,
        destinationLot,

        traceability: {
          baseCurrencyCode:
            tripSettings.baseCurrencyCode,

          equivalentBaseAmount:
            fifoResult.totalBaseAmount,

          effectiveRate,

          allocations: fifoResult.allocations,
        },
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}