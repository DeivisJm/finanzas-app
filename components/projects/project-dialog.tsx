"use client";

import {
  PROJECT_COLOR_OPTIONS,
  PROJECT_ICON_OPTIONS,
} from "@/components/projects/project-dialog-options";
import { AppIcon } from "@/components/ui/app-icon";
import type {
  CreateProjectInput,
  ProjectSummary,
  ProjectType,
  UpdateProjectInput,
} from "@/types/project";
import {
  Check,
  Plane,
  X,
} from "lucide-react";
import { useState } from "react";

interface ProjectDialogProps {
  isOpen: boolean;
  project?: ProjectSummary | null;
  onClose: () => void;
  onSaved: (
    project: ProjectSummary,
  ) => void;
}

interface ProjectDialogContentProps {
  project?: ProjectSummary | null;
  onClose: () => void;
  onSaved: (
    project: ProjectSummary,
  ) => void;
}

/**
 * Mounts a fresh form for each create or edit operation.
 */
export function ProjectDialog({
  isOpen,
  project,
  onClose,
  onSaved,
}: ProjectDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ProjectDialogContent
      key={project?.id ?? "new-project"}
      project={project}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

/**
 * Displays the form used to create or edit a project.
 */
function ProjectDialogContent({
  project,
  onClose,
  onSaved,
}: ProjectDialogContentProps) {
  const [name, setName] = useState(
    project?.name ?? "",
  );

  const [description, setDescription] =
    useState(
      project?.description ?? "",
    );

  const [color, setColor] = useState(
    project?.color ?? "#2563eb",
  );

  const [icon, setIcon] = useState(
    project?.icon ?? "credit-card",
  );

  const [type, setType] =
    useState<ProjectType>(
      project?.type ?? "STANDARD",
    );

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isEditing = Boolean(project);
  const isTripProject = type === "TRIP";

  /**
   * Selects an icon and synchronizes its functional project type.
   */
  function handleIconSelection(
    selectedIcon: string,
  ): void {
    const option =
      PROJECT_ICON_OPTIONS.find(
        (iconOption) =>
          iconOption.value ===
          selectedIcon,
      );

    if (!option) {
      return;
    }

    setIcon(option.value);
    setType(option.projectType);
  }

  /**
   * Persists the project using the create or update endpoint.
   */
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
        type,
      };

      const response = await fetch(
        isEditing
          ? `/api/projects/${project?.id}`
          : "/api/projects",
        {
          method: isEditing
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result: unknown =
        await response.json();

      if (
        typeof result !== "object" ||
        result === null
      ) {
        throw new Error(
          "El servidor devolvió una respuesta inválida.",
        );
      }

      const responseData =
        result as Partial<
          ProjectSummary & {
            message: string;
          }
        >;

      if (!response.ok) {
        throw new Error(
          responseData.message ??
            "No fue posible guardar el proyecto.",
        );
      }

      onSaved({
        ...(responseData as ProjectSummary),

        type:
          responseData.type ??
          project?.type ??
          type,

        folderCount:
          responseData.folderCount ??
          project?.folderCount ??
          0,

        expenseCount:
          responseData.expenseCount ??
          project?.expenseCount ??
          0,

        totalAmount:
          responseData.totalAmount ??
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

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/75 p-0 backdrop-blur-md sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
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
        className="relative max-h-[92dvh] w-full overflow-hidden rounded-t-[2.25rem] border border-zinc-200/80 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-2xl sm:rounded-[2.25rem]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle at top left, ${color}, transparent 65%)`,
          }}
        />

        <div className="relative flex max-h-[92dvh] flex-col">
          <header className="flex items-start justify-between gap-5 border-b border-zinc-200/70 px-5 py-5 dark:border-zinc-800 sm:px-8 sm:py-6">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="relative flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  boxShadow: `0 12px 28px ${color}35`,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent"
                />

                <AppIcon
                  name={icon}
                  className="relative"
                  size={23}
                />
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color }}
                >
                  {isEditing
                    ? "Configuración del espacio"
                    : "Nuevo espacio de trabajo"}
                </p>

                <h2
                  id="project-dialog-title"
                  className="mt-1 truncate text-2xl font-semibold tracking-tight"
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
            className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7"
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
                      setName(
                        event.target.value,
                      )
                    }
                    placeholder="Ejemplo: Viajes personales"
                    required
                    minLength={2}
                    maxLength={60}
                    autoFocus
                    disabled={isSubmitting}
                    className="h-13 w-full rounded-2xl border border-zinc-300 bg-zinc-100 px-4 text-base text-zinc-950 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
                      <AppIcon
                        name={icon}
                        size={18}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {name.trim() ||
                          "Nuevo proyecto"}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {isTripProject
                          ? "Espacio de viajes"
                          : "Espacio estándar"}
                      </p>
                    </div>
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
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Explicá brevemente qué vas a organizar en este proyecto."
                  maxLength={160}
                  rows={3}
                  disabled={isSubmitting}
                  className="min-h-24 w-full resize-none rounded-2xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-base text-zinc-950 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <fieldset disabled={isSubmitting}>
                <legend className="mb-3 text-sm font-semibold">
                  Color del proyecto
                </legend>

                <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                  {PROJECT_COLOR_OPTIONS.map(
                    (colorOption) => {
                      const selected =
                        color === colorOption;

                      return (
                        <button
                          key={colorOption}
                          type="button"
                          onClick={() =>
                            setColor(
                              colorOption,
                            )
                          }
                          aria-label={`Seleccionar color ${colorOption}`}
                          aria-pressed={
                            selected
                          }
                          className={`relative size-10 rounded-full transition duration-200 hover:scale-110 ${
                            selected
                              ? "ring-2 ring-zinc-950 ring-offset-3 ring-offset-zinc-50 dark:ring-white dark:ring-offset-zinc-950"
                              : ""
                          }`}
                          style={{
                            backgroundColor:
                              colorOption,
                          }}
                        >
                          {selected ? (
                            <span className="absolute inset-0 flex items-center justify-center text-white">
                              <Check
                                size={17}
                                strokeWidth={
                                  3
                                }
                              />
                            </span>
                          ) : null}
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>

              <fieldset disabled={isSubmitting}>
                <legend className="mb-3 text-sm font-semibold">
                  Tipo e ícono
                </legend>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PROJECT_ICON_OPTIONS.map(
                    (iconOption) => {
                      const selected =
                        icon ===
                        iconOption.value;

                      return (
                        <button
                          key={
                            iconOption.value
                          }
                          type="button"
                          onClick={() =>
                            handleIconSelection(
                              iconOption.value,
                            )
                          }
                          aria-pressed={
                            selected
                          }
                          className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 sm:px-4 ${
                            selected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                          }`}
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                              selected
                                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            <AppIcon
                              name={
                                iconOption.value
                              }
                              size={17}
                            />
                          </div>

                          <span className="truncate text-sm font-medium">
                            {
                              iconOption.label
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>

              {isTripProject ? (
                <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white dark:bg-blue-500">
                    <Plane size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Proyecto de viaje
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800/80 dark:text-blue-300/80">
                      Sus carpetas utilizarán
                      monedas, conversiones y
                      compras específicas de
                      viaje.
                    </p>
                  </div>
                </div>
              ) : null}

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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
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