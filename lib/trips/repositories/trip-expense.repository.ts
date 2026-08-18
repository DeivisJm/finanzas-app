import {
  Prisma,
  type TripExpense,
} from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export interface CreateTripExpenseRecordInput {
  tripSettingsId: number;
  accountId: number;
  description: string;
  category: string;
  currencyCode: string;
  amount: Prisma.Decimal;
  equivalentBaseAmount: Prisma.Decimal;
  expenseDate: Date;
  note: string | null;
}

/**
 * Creates a travel expense inside an existing transaction.
 */
export async function createTripExpenseRecord(
  transaction: TransactionClient,
  input: CreateTripExpenseRecordInput,
): Promise<TripExpense> {
  return transaction.tripExpense.create({
    data: {
      tripSettingsId: input.tripSettingsId,
      accountId: input.accountId,
      description: input.description,
      category: input.category,
      currencyCode: input.currencyCode,
      amount: input.amount,
      equivalentBaseAmount:
        input.equivalentBaseAmount,
      expenseDate: input.expenseDate,
      note: input.note,
    },
  });
}

/**
 * Creates an allocation linking an expense to the currency lot
 * that financed part of the purchase.
 */
export async function createTripExpenseAllocation(
  transaction: TransactionClient,
  input: {
    tripExpenseId: number;
    sourceLotId: number;
    allocatedAmount: Prisma.Decimal;
    allocatedBaseAmount: Prisma.Decimal;
  },
) {
  return transaction.tripExpenseAllocation.create({
    data: {
      tripExpenseId: input.tripExpenseId,
      sourceLotId: input.sourceLotId,
      allocatedAmount: input.allocatedAmount,
      allocatedBaseAmount:
        input.allocatedBaseAmount,
    },
  });
}