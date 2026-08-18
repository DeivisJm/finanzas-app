/**
 * Formats a monetary value using its ISO currency code.
 *
 * Unknown currencies gracefully fall back to a simple
 * "amount CODE" representation.
 */
export function formatTripCurrency(
  value: string | number,
  currencyCode: string,
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `0 ${currencyCode}`;
  }

  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 4,
    }).format(numericValue);
  } catch {
    return `${numericValue.toLocaleString("es-CR")} ${currencyCode}`;
  }
}