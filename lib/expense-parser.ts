interface ParsedExpense {
  description: string;
  amount: number;
}

/**
 * Extracts an expense amount and description from natural-language text.
 *
 * Supported examples:
 * - "Gasté 5000 en gasolina"
 * - "Pagué ₡12.500 en supermercado"
 * - "2500 almuerzo"
 *
 * @param text Text entered by the user.
 * @returns Parsed expense description and amount.
 * @throws Error when the input does not contain valid expense information.
 */
export function parseExpense(text: string): ParsedExpense {
  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new Error("La información del gasto es obligatoria.");
  }

  const amountMatch = normalizedText.match(
    /(?:₡\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)/
  );

  if (!amountMatch) {
    throw new Error("No se encontró un monto válido.");
  }

  const normalizedAmount = amountMatch[1].replace(/[.,]/g, "");
  const amount = Number.parseInt(normalizedAmount, 10);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El monto debe ser mayor que cero.");
  }

  const description = normalizedText
    .replace(amountMatch[0], " ")
    .replace(
      /\b(gasté|gaste|pagué|pague|gastado|colones|crc)\b/gi,
      " "
    )
    .replace(/\b(en|de|por)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!description) {
    throw new Error("La descripción del gasto es obligatoria.");
  }

  return {
    description,
    amount,
  };
}