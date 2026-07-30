import { z } from "zod";

const projectFieldsSchema = {
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no puede superar los 60 caracteres."),

  description: z
    .string()
    .trim()
    .max(
      160,
      "La descripción no puede superar los 160 caracteres.",
    )
    .optional()
    .or(z.literal("")),

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

export const createProjectSchema = z.object({
  ...projectFieldsSchema,
});

export const updateProjectSchema = z.object({
  ...projectFieldsSchema,
});

export type CreateProjectData = z.infer<
  typeof createProjectSchema
>;

export type UpdateProjectData = z.infer<
  typeof updateProjectSchema
>;