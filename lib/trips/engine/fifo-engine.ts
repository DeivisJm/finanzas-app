import {
  Prisma,
  type CurrencyLot,
} from "@prisma/client";

import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import {
  roundMoney,
  toPositiveDecimal,
  ZERO_DECIMAL,
  type DecimalInput,
} from "@/lib/trips/utils/decimal";

export interface FifoAllocation {
  lotId: number;
  allocatedAmount: Prisma.Decimal;
  allocatedBaseAmount: Prisma.Decimal;
  remainingAmount: Prisma.Decimal;
}

export interface FifoAllocationResult {
  allocations: FifoAllocation[];
  totalAllocatedAmount: Prisma.Decimal;
  totalBaseAmount: Prisma.Decimal;
}

/**
 * Allocates an amount across available currency lots using FIFO order.
 *
 * This function is intentionally database-independent so the allocation
 * algorithm can be tested without Prisma or PostgreSQL.
 */
export function allocateLotsFifo(
  lots: CurrencyLot[],
  requestedAmount: DecimalInput,
): FifoAllocationResult {
  const amount = roundMoney(
    toPositiveDecimal(
      requestedAmount,
      "monto a utilizar",
    ),
  );

  let remainingToAllocate = amount;

  let totalBaseAmount = new Prisma.Decimal(0);

  const allocations: FifoAllocation[] = [];

  for (const lot of lots) {
    if (remainingToAllocate.lte(ZERO_DECIMAL)) {
      break;
    }

    if (lot.remainingAmount.lte(ZERO_DECIMAL)) {
      continue;
    }

    const allocatedAmount = Prisma.Decimal.min(
      lot.remainingAmount,
      remainingToAllocate,
    );

    const allocatedBaseAmount = roundMoney(
      allocatedAmount.mul(
        lot.unitCostInBaseCurrency,
      ),
    );

    const remainingAmount = roundMoney(
      lot.remainingAmount.sub(allocatedAmount),
    );

    allocations.push({
      lotId: lot.id,
      allocatedAmount,
      allocatedBaseAmount,
      remainingAmount,
    });

    remainingToAllocate =
      remainingToAllocate.sub(allocatedAmount);

    totalBaseAmount =
      totalBaseAmount.add(allocatedBaseAmount);
  }

  if (remainingToAllocate.gt(ZERO_DECIMAL)) {
    throw new TripDomainError(
      "INSUFFICIENT_BALANCE",
      "Los lotes disponibles no contienen suficiente saldo para completar la operación.",
      409,
    );
  }

  return {
    allocations,
    totalAllocatedAmount: amount,
    totalBaseAmount: roundMoney(totalBaseAmount),
  };
}