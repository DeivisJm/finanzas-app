/**
 * Converts a text value into a URL-safe slug.
 *
 * Example:
 * "Tarjetas de Crédito" becomes "tarjetas-de-credito".
 */
export function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}