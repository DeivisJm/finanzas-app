import { z } from "zod";

const projectTypeSchema = z.enum([
  "STANDARD",
  "TRIP",
]);

const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "El nombre debe contener al menos 2 caracteres.",
    )
    .max(
      60,
      "El nombre no puede superar los 60 caracteres.",
    ),

  description: z
    .string()
    .trim()
    .max(
      160,
      "La descripción no puede superar los 160 caracteres.",
    )
    .default(""),

  color: z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "El color seleccionado no es válido.",
    ),

  icon: z
    .string()
    .trim()
    .min(1, "Debés seleccionar un ícono.")
    .max(50, "El identificador del ícono no es válido."),

  type: projectTypeSchema,
});

export const createProjectSchema =
  projectFormSchema;

export const updateProjectSchema =
  projectFormSchema;