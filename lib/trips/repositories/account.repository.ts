import {
  Prisma,
  type TripCurrencyAccount,
} from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

/**
 * Finds a currency account belonging to a trip.
 */
export async function findTripAccount(
  transaction: TransactionClient,
  tripSettingsId: number,
  currencyCode: string,
): Promise<TripCurrencyAccount | null> {
  return transaction.tripCurrencyAccount.findUnique({
    where: {
      tripSettingsId_currencyCode: {
        tripSettingsId,
        currencyCode,
      },
    },
  });
}

/**
 * Returns an existing currency account or creates a new empty account.
 */
export async function getOrCreateTripAccount(
  transaction: TransactionClient,
  tripSettingsId: number,
  currencyCode: string,
): Promise<TripCurrencyAccount> {
  return transaction.tripCurrencyAccount.upsert({
    where: {
      tripSettingsId_currencyCode: {
        tripSettingsId,
        currencyCode,
      },
    },

    create: {
      tripSettingsId,
      currencyCode,
      currentBalance: 0,
    },

    update: {},
  });
}

/**
 * Decreases the available balance of a currency account.
 */
export async function decreaseAccountBalance(
  transaction: TransactionClient,
  accountId: number,
  amount: Prisma.Decimal,
): Promise<TripCurrencyAccount> {
  return transaction.tripCurrencyAccount.update({
    where: {
      id: accountId,
    },

    data: {
      currentBalance: {
        decrement: amount,
      },
    },
  });
}

/**
 * Increases the available balance of a currency account.
 */
export async function increaseAccountBalance(
  transaction: TransactionClient,
  accountId: number,
  amount: Prisma.Decimal,
): Promise<TripCurrencyAccount> {
  return transaction.tripCurrencyAccount.update({
    where: {
      id: accountId,
    },

    data: {
      currentBalance: {
        increment: amount,
      },
    },
  });
}