"use client";

import {
  Check,
  Folder,
} from "lucide-react"; 

import type {
  CreateProjectInput,
  ProjectSummary,
  UpdateProjectInput,
} from "@/types/project";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  GraduationCap,
  House,
  Laptop,
  Plane,
  ShoppingBag,
  Target,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectDialogProps {
  isOpen: boolean;
  project?: ProjectSummary | null;
  onClose: () => void;
  onSaved: (project: ProjectSummary) => void;
}

const colorOptions = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#52525b",
];

const iconOptions = [
  {
    value: "credit-card",
    label: "Tarjetas",
    icon: CreditCard,
  },
  {
    value: "plane",
    label: "Viajes",
    icon: Plane,
  },
  {
    value: "briefcase-business",
    label: "Trabajo",
    icon: BriefcaseBusiness,
  },
  {
    value: "house",
    label: "Hogar",
    icon: House,
  },
  {
    value: "graduation",
    label: "Estudios",
    icon: GraduationCap,
  },
  {
    value: "shopping",
    label: "Compras",
    icon: ShoppingBag,
  },
  {
    value: "laptop",
    label: "Tecnología",
    icon: Laptop,
  },
  {
    value: "building",
    label: "Negocio",
    icon: Building2,
  },
  {
    value: "target",
    label: "Meta",
    icon: Target,
  },
];

/**
 * Displays the form used to create or edit a project.
 */
export function ProjectDialog({
  isOpen,
  project,
  onClose,
  onSaved,
}: ProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [color, setColor] = useState("#2563eb");
  const [icon, setIcon] = useState("folder");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isEditing = Boolean(project);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setColor(project?.color ?? "#2563eb");
    setIcon(project?.icon ?? "folder");
    setError("");
  }, [isOpen, project]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const payload:
        | CreateProjectInput
        | UpdateProjectInput = {
        name,
        description,
        color,
        icon,
      };

      const response = await fetch(
        isEditing
          ? `/api/projects/${project?.id}`
          : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible guardar el proyecto.",
        );
      }

      onSaved({
        ...result,
        folderCount:
          result.folderCount ??
          project?.folderCount ??
          0,
        expenseCount:
          result.expenseCount ??
          project?.expenseCount ??
          0,
        totalAmount:
          result.totalAmount ??
          project?.totalAmount ??
          0,
      });

      onClose();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible guardar el proyecto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  if (!isOpen) {
  return null;
}

const SelectedIcon =
  iconOptions.find(
    (iconOption) => iconOption.value === icon,
  )?.icon ?? Folder;

return (
  <div
    role="presentation"
    className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/75 p-0 backdrop-blur-md sm:items-center sm:p-5"
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget &&
        !isSubmitting
      ) {
        onClose();
      }
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      className="relative max-h-[92vh] w-full overflow-hidden rounded-t-[2.25rem] border border-zinc-200/80 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-2xl sm:rounded-[2.25rem]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle at top left, ${color}, transparent 65%)`,
        }}
      />

      <div className="relative flex max-h-[92vh] flex-col">
        <header className="flex items-start justify-between gap-5 border-b border-zinc-200/70 px-6 py-6 dark:border-zinc-800 sm:px-8">
          <div className="flex items-center gap-4">
            <div
              className="relative flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                boxShadow: `0 12px 28px ${color}35`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />

              <SelectedIcon
                className="relative"
                size={23}
              />
            </div>

            <div>
              <p
                className="text-sm font-medium"
                style={{
                  color,
                }}
              >
                {isEditing
                  ? "Configuración del espacio"
                  : "Nuevo espacio de trabajo"}
              </p>

              <h2
                id="project-dialog-title"
                className="mt-1 text-2xl font-semibold tracking-tight"
              >
                {isEditing
                  ? "Editar proyecto"
                  : "Crear proyecto"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white/70 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Cerrar formulario"
          >
            <X size={19} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-7 sm:px-8"
        >
          <div className="space-y-7">
            <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Nombre del proyecto
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Ejemplo: Gastos del hogar"
                  required
                  minLength={2}
                  maxLength={60}
                  autoFocus
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-indigo-400"
                />
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Vista previa
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                      backgroundColor: color,
                    }}
                  >
                    <SelectedIcon size={18} />
                  </div>

                  <p className="truncate text-sm font-semibold">
                    {name.trim() || "Nuevo proyecto"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="project-description"
                  className="text-sm font-semibold"
                >
                  Descripción
                </label>

                <span className="text-xs text-zinc-400">
                  {description.length}/160
                </span>
              </div>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Explicá brevemente qué vas a organizar en este proyecto."
                maxLength={160}
                rows={3}
                className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-indigo-400"
              />
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold">
                Color del proyecto
              </legend>

              <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    aria-label={`Seleccionar color ${colorOption}`}
                    className={`relative size-10 rounded-full transition duration-200 hover:scale-110 ${
                      color === colorOption
                        ? "ring-2 ring-zinc-950 ring-offset-3 ring-offset-zinc-50 dark:ring-white dark:ring-offset-zinc-950"
                        : ""
                    }`}
                    style={{
                      backgroundColor: colorOption,
                    }}
                  >
                    {color === colorOption ? (
                      <span className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={17} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold">
                Ícono
              </legend>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {iconOptions.map((iconOption) => {
                  const Icon = iconOption.icon;
                  const selected =
                    icon === iconOption.value;

                  return (
                    <button
                      key={iconOption.value}
                      type="button"
                      onClick={() =>
                        setIcon(iconOption.value)
                      }
                      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200 ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                          selected
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        <Icon size={17} />
                      </div>

                      <span className="text-sm font-medium">
                        {iconOption.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error ? (
              <p
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </p>
            ) : null}
          </div>

          <footer className="sticky bottom-0 mt-8 flex flex-col-reverse gap-3 border-t border-zinc-200 bg-white/95 pt-5 backdrop-blur sm:flex-row sm:justify-end dark:border-zinc-800 dark:bg-zinc-900/95">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-2xl border border-zinc-200 px-5 text-sm font-semibold transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear proyecto"}
            </button>
          </footer>
        </form>
      </div>
    </section>
  </div>
);
}