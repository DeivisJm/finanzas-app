import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";

/**
 * Normalizes and validates a required text value.
 */
export function normalizeRequiredText(
  value: string,
  fieldName: string,
  maxLength = 160,
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new TripDomainError(
      "INVALID_AMOUNT",
      `El campo ${fieldName} es obligatorio.`,
    );
  }

  if (normalizedValue.length > maxLength) {
    throw new TripDomainError(
      "INVALID_AMOUNT",
      `El campo ${fieldName} no puede superar los ${maxLength} caracteres.`,
    );
  }

  return normalizedValue;
}

/**
 * Normalizes an optional text value.
 */
export function normalizeOptionalText(
  value?: string | null,
  maxLength = 300,
): string | null {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maxLength) {
    throw new TripDomainError(
      "INVALID_AMOUNT",
      `El texto no puede superar los ${maxLength} caracteres.`,
    );
  }

  return normalizedValue;
}