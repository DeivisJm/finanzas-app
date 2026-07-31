import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/**
 * Normalizes an ISO-like currency code entered by the user.
 */
export function normalizeCurrencyCode(currencyCode: string): string {
  const normalizedCode = currencyCode.trim().toUpperCase();

  if (!CURRENCY_CODE_PATTERN.test(normalizedCode)) {
    throw new TripDomainError(
      "INVALID_CURRENCY",
      "La moneda debe utilizar un código válido de tres letras, por ejemplo CRC, USD o COP.",
    );
  }

  return normalizedCode;
}

/**
 * Checks whether two currency codes represent the same currency.
 */
export function currenciesAreEqual(
  firstCurrencyCode: string,
  secondCurrencyCode: string,
): boolean {
  return (
    normalizeCurrencyCode(firstCurrencyCode) ===
    normalizeCurrencyCode(secondCurrencyCode)
  );
}