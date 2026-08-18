import {
  Prisma,
  type CurrencyLot,
} from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

/**
 * Returns available currency lots using FIFO order.
 */
export async function findAvailableLots(
  transaction: TransactionClient,
  accountId: number,
): Promise<CurrencyLot[]> {
  return transaction.currencyLot.findMany({
    where: {
      accountId,

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
  });
}

/**
 * Updates the remaining amount of a currency lot.
 */
export async function updateLotRemainingAmount(
  transaction: TransactionClient,
  lotId: number,
  remainingAmount: Prisma.Decimal,
): Promise<CurrencyLot> {
  return transaction.currencyLot.update({
    where: {
      id: lotId,
    },

    data: {
      remainingAmount,
    },
  });
}