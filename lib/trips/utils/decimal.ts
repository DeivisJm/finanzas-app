import { Prisma } from "@prisma/client";

import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";

export type DecimalInput = Prisma.Decimal | string | number;

export const ZERO_DECIMAL = new Prisma.Decimal(0);

/**
 * Converts an external numeric value into a Prisma Decimal.
 */
export function toDecimal(
  value: DecimalInput,
  fieldName = "monto",
): Prisma.Decimal {
  try {
    const decimalValue = new Prisma.Decimal(value);

    if (!decimalValue.isFinite()) {
      throw new Error("Non-finite decimal value");
    }

    return decimalValue;
  } catch {
    throw new TripDomainError(
      "INVALID_AMOUNT",
      `El valor indicado para ${fieldName} no es válido.`,
    );
  }
}

/**
 * Validates and returns a strictly positive monetary value.
 */
export function toPositiveDecimal(
  value: DecimalInput,
  fieldName = "monto",
): Prisma.Decimal {
  const decimalValue = toDecimal(value, fieldName);

  if (decimalValue.lte(ZERO_DECIMAL)) {
    throw new TripDomainError(
      "INVALID_AMOUNT",
      `El valor de ${fieldName} debe ser mayor que cero.`,
    );
  }

  return decimalValue;
}

/**
 * Rounds a regular monetary amount to four decimal places.
 */
export function roundMoney(value: DecimalInput): Prisma.Decimal {
  return toDecimal(value).toDecimalPlaces(
    4,
    Prisma.Decimal.ROUND_HALF_UP,
  );
}

/**
 * Rounds a calculated exchange rate or unit cost.
 */
export function roundRate(value: DecimalInput): Prisma.Decimal {
  return toDecimal(value).toDecimalPlaces(
    10,
    Prisma.Decimal.ROUND_HALF_UP,
  );
}