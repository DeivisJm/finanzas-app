import { z } from "zod";

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),

  color: z.string().regex(
    /^#[0-9A-Fa-f]{6}$/,
    "El color seleccionado no es válido."
  ),

  icon: z
    .string()
    .trim()
    .min(1, "Debe seleccionar un icono."),

  projectId: z
    .number()
    .int()
    .positive("El proyecto seleccionado no es válido."),
});

export type CreateFolderData = z.infer<
  typeof createFolderSchema
>;