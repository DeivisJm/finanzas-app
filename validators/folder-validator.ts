import { z } from "zod";

const folderFieldsSchema = {
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),

  color: z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "El color debe tener formato hexadecimal.",
    ),

  icon: z
    .string()
    .trim()
    .min(1, "Seleccioná un ícono.")
    .max(40, "El identificador del ícono no es válido."),
};

export const createFolderSchema = z.object({
  ...folderFieldsSchema,

  projectId: z
    .number()
    .int("El proyecto debe ser un número entero.")
    .positive("El proyecto seleccionado no es válido."),
});

export const updateFolderSchema = z.object({
  ...folderFieldsSchema,
});

export type CreateFolderData = z.infer<
  typeof createFolderSchema
>;

export type UpdateFolderData = z.infer<
  typeof updateFolderSchema
>;