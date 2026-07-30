import { z } from "zod";

export const createExpenseSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Escribí una descripción y un monto.")
    .max(150, "El gasto no puede superar los 150 caracteres."),
});

export const updateExpenseSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(2, "La descripción debe tener al menos 2 caracteres.")
      .max(120, "La descripción no puede superar los 120 caracteres.")
      .optional(),

    amount: z
      .number()
      .int("El monto debe ser un número entero.")
      .positive("El monto debe ser mayor que cero.")
      .optional(),
  })
  .refine(
    (data) =>
      data.description !== undefined ||
      data.amount !== undefined,
    {
      message: "Debés modificar al menos un campo.",
    },
  );

export type CreateExpenseData = z.infer<
  typeof createExpenseSchema
>;

export type UpdateExpenseData = z.infer<
  typeof updateExpenseSchema
>;