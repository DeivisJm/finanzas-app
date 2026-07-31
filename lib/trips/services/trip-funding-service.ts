import {
  CurrencyLotSourceType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import type { AddTripFundingInput } from "@/lib/trips/services/trip-service.types";
import { normalizeCurrencyCode } from "@/lib/trips/utils/currency";
import {
  roundMoney,
  roundRate,
  toPositiveDecimal,
} from "@/lib/trips/utils/decimal";

export async function addTripFunding(
  input: AddTripFundingInput,
) {
  const currencyCode = normalizeCurrencyCode(
    input.currencyCode,
  );

  const amount = roundMoney(
    toPositiveDecimal(
      input.amount,
      "monto inicial",
    ),
  );

  const note = input.note?.trim() || null;
  const fundingDate = input.fundingDate ?? new Date();

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
          "El viaje debe configurarse antes de agregar fondos.",
          404,
        );
      }

      let unitCostInBaseCurrency =
        new Prisma.Decimal(1);

      if (
        currencyCode !==
        tripSettings.baseCurrencyCode
      ) {
        if (
          input.baseCurrencyAmount === null ||
          input.baseCurrencyAmount === undefined
        ) {
          throw new TripDomainError(
            "INVALID_AMOUNT",
            `Para agregar fondos en ${currencyCode}, debés indicar su costo equivalente en ${tripSettings.baseCurrencyCode}.`,
          );
        }

        const baseCurrencyAmount = roundMoney(
          toPositiveDecimal(
            input.baseCurrencyAmount,
            "equivalente en moneda base",
          ),
        );

        unitCostInBaseCurrency = roundRate(
          baseCurrencyAmount.dividedBy(amount),
        );
      }

      const account =
        await transaction.tripCurrencyAccount.upsert({
          where: {
            tripSettingsId_currencyCode: {
              tripSettingsId: tripSettings.id,
              currencyCode,
            },
          },
          create: {
            tripSettingsId: tripSettings.id,
            currencyCode,
            currentBalance: amount,
          },
          update: {
            currentBalance: {
              increment: amount,
            },
          },
        });

      const funding =
        await transaction.tripFunding.create({
          data: {
            tripSettingsId: tripSettings.id,
            accountId: account.id,
            amount,
            note,
            fundingDate,
          },
        });

      const lot =
        await transaction.currencyLot.create({
          data: {
            accountId: account.id,
            sourceType:
              CurrencyLotSourceType.FUNDING,
            fundingId: funding.id,
            originalAmount: amount,
            remainingAmount: amount,
            unitCostInBaseCurrency,
          },
        });

      const updatedAccount =
        await transaction.tripCurrencyAccount.findUniqueOrThrow(
          {
            where: {
              id: account.id,
            },
          },
        );

      return {
        funding,
        lot,
        account: updatedAccount,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}