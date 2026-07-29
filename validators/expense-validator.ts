import { z } from "zod";

export const createExpenseSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Escribí una descripción y un monto.")
    .max(150, "El gasto no puede superar los 150 caracteres."),
});

export type CreateExpenseData = z.infer<
  typeof createExpenseSchema
>;