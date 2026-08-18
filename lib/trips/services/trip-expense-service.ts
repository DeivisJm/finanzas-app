import { Prisma } from "@prisma/client";

import { allocateLotsFifo } from "@/lib/trips/engine/fifo-engine";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import {
  decreaseAccountBalance,
  findTripAccount,
} from "@/lib/trips/repositories/account.repository";
import {
  findAvailableLots,
  updateLotRemainingAmount,
} from "@/lib/trips/repositories/lot.repository";
import {
  createTripExpenseAllocation,
  createTripExpenseRecord,
} from "@/lib/trips/repositories/trip-expense.repository";
import type { CreateTripExpenseInput } from "@/lib/trips/services/trip-service.types";
import { normalizeCurrencyCode } from "@/lib/trips/utils/currency";
import {
  roundMoney,
  toPositiveDecimal,
} from "@/lib/trips/utils/decimal";
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from "@/lib/trips/utils/text";
import { prisma } from "@/lib/prisma";

/**
 * Registers a travel expense while preserving its complete FIFO
 * traceability back to the trip's base currency.
 */
export async function createTripExpense(
  input: CreateTripExpenseInput,
) {
  const currencyCode = normalizeCurrencyCode(
    input.currencyCode,
  );

  const amount = roundMoney(
    toPositiveDecimal(
      input.amount,
      "monto del gasto",
    ),
  );

  const description = normalizeRequiredText(
    input.description,
    "descripción",
    120,
  );

  const category = normalizeRequiredText(
    input.category,
    "categoría",
    60,
  );

  const note = normalizeOptionalText(
    input.note,
    300,
  );

  const expenseDate =
    input.expenseDate ?? new Date();

  return prisma.$transaction(
    async (transaction) => {
      /*
       * Retrieve the trip configuration first because every expense
       * must belong to an explicitly configured travel folder.
       */
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
          "El viaje debe configurarse antes de registrar compras.",
          404,
        );
      }

      /*
       * Expenses can only be paid using currencies that currently
       * exist inside the travel wallet.
       */
      const account = await findTripAccount(
        transaction,
        tripSettings.id,
        currencyCode,
      );

      if (!account) {
        throw new TripDomainError(
          "ACCOUNT_NOT_FOUND",
          `No existe una cuenta disponible en ${currencyCode}.`,
          404,
        );
      }

      if (account.currentBalance.lt(amount)) {
        throw new TripDomainError(
          "INSUFFICIENT_BALANCE",
          `No hay suficiente saldo disponible en ${currencyCode}.`,
          409,
        );
      }

      /*
       * Available lots are returned oldest-first. The FIFO engine
       * determines exactly which amounts will finance this purchase.
       */
      const availableLots =
        await findAvailableLots(
          transaction,
          account.id,
        );

      const fifoResult = allocateLotsFifo(
        availableLots,
        amount,
      );

      /*
       * The expense stores its equivalent cost in the user's base
       * currency so reports do not depend on future exchange rates.
       */
      const expense =
        await createTripExpenseRecord(
          transaction,
          {
            tripSettingsId:
              tripSettings.id,

            accountId: account.id,

            description,
            category,
            currencyCode,
            amount,

            equivalentBaseAmount:
              fifoResult.totalBaseAmount,

            expenseDate,
            note,
          },
        );

      /*
       * Persist each FIFO allocation and update the remaining amount
       * of every consumed currency lot.
       */
      for (const allocation of fifoResult.allocations) {
        await updateLotRemainingAmount(
          transaction,
          allocation.lotId,
          allocation.remainingAmount,
        );

        await createTripExpenseAllocation(
          transaction,
          {
            tripExpenseId: expense.id,
            sourceLotId: allocation.lotId,

            allocatedAmount:
              allocation.allocatedAmount,

            allocatedBaseAmount:
              allocation.allocatedBaseAmount,
          },
        );
      }

      /*
       * The cached account balance must be updated in the same
       * transaction as the expense and FIFO allocations.
       */
      const updatedAccount =
        await decreaseAccountBalance(
          transaction,
          account.id,
          amount,
        );

      return {
        expense,
        account: updatedAccount,

        traceability: {
          currencyCode,

          baseCurrencyCode:
            tripSettings.baseCurrencyCode,

          amount,

          equivalentBaseAmount:
            fifoResult.totalBaseAmount,

          allocations:
            fifoResult.allocations,
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