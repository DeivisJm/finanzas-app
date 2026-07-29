/**
 * Formats a numeric value as Costa Rican colones.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an integer using the Costa Rican locale.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CR").format(value);
}