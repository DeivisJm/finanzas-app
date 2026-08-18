"use client";

import { AppIcon } from "@/components/ui/app-icon";
import type {
  CreateFolderInput,
  FolderSummary,
  UpdateFolderInput,
} from "@/types/folder";
import { X } from "lucide-react";
import { useState } from "react";

interface FolderDialogProps {
  isOpen: boolean;
  projectId: number;
  folder?: FolderSummary | null;
  onClose: () => void;
  onSaved: (folder: FolderSummary) => void;
}

interface FolderDialogContentProps {
  projectId: number;
  folder?: FolderSummary | null;
  onClose: () => void;
  onSaved: (folder: FolderSummary) => void;
}

const COLOR_OPTIONS = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#52525b",
] as const;

const ICON_OPTIONS = [
  {
    value: "credit-card",
    label: "Tarjeta",
  },
  {
    value: "landmark",
    label: "Banco",
  },
  {
    value: "wallet-cards",
    label: "Billetera",
  },
  {
    value: "receipt-text",
    label: "Cuenta",
  },
  {
    value: "plane",
    label: "Viaje",
  },
  {
    value: "folder",
    label: "Carpeta",
  },
] as const;

/**
 * Mounts a fresh form whenever a folder dialog is opened.
 */
export function FolderDialog({
  isOpen,
  projectId,
  folder,
  onClose,
  onSaved,
}: FolderDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <FolderDialogContent
      key={folder?.id ?? "new-folder"}
      projectId={projectId}
      folder={folder}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

/**
 * Displays the create and edit folder form.
 */
function FolderDialogContent({
  projectId,
  folder,
  onClose,
  onSaved,
}: FolderDialogContentProps) {
  const [name, setName] = useState(
    folder?.name ?? "",
  );

  const [color, setColor] = useState(
    folder?.color ?? "#2563eb",
  );

  const [icon, setIcon] = useState(
    folder?.icon ?? "credit-card",
  );

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isEditing = Boolean(folder);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const payload:
        | CreateFolderInput
        | UpdateFolderInput = isEditing
        ? {
            name,
            color,
            icon,
          }
        : {
            name,
            color,
            icon,
            projectId,
          };

      const response = await fetch(
        isEditing
          ? `/api/folders/${folder?.id}`
          : "/api/folders",
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
            "No fue posible guardar la carpeta.",
        );
      }

      onSaved({
        ...result,

        expenseCount:
          result.expenseCount ??
          folder?.expenseCount ??
          0,

        totalAmount:
          result.totalAmount ??
          folder?.totalAmount ??
          0,

        createdAt:
          typeof result.createdAt === "string"
            ? result.createdAt
            : new Date(
                result.createdAt,
              ).toISOString(),
      });

      onClose();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible guardar la carpeta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
        aria-labelledby="folder-dialog-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-lg sm:rounded-[2rem]"
      >
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {isEditing
                ? "Configuración"
                : "Nueva carpeta"}
            </p>

            <h2
              id="folder-dialog-title"
              className="mt-1 text-2xl font-semibold tracking-tight"
            >
              {isEditing
                ? "Editar carpeta"
                : "Crear carpeta"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex size-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >
          <div>
            <label
              htmlFor="folder-name"
              className="mb-2 block text-sm font-medium"
            >
              Nombre
            </label>

            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ejemplo: BAC Credomatic"
              autoFocus
              required
              minLength={2}
              maxLength={50}
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-950/5 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:bg-zinc-950"
            />
          </div>

          <fieldset disabled={isSubmitting}>
            <legend className="mb-3 text-sm font-medium">
              Color
            </legend>

            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map(
                (colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() =>
                      setColor(colorOption)
                    }
                    aria-label={`Seleccionar color ${colorOption}`}
                    aria-pressed={
                      color === colorOption
                    }
                    className={`size-10 rounded-full border-4 transition hover:scale-105 ${
                      color === colorOption
                        ? "border-zinc-950 dark:border-white"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        colorOption,
                    }}
                  />
                ),
              )}
            </div>
          </fieldset>

          <fieldset disabled={isSubmitting}>
            <legend className="mb-3 text-sm font-medium">
              Ícono
            </legend>

            <div className="grid grid-cols-3 gap-3">
              {ICON_OPTIONS.map(
                (iconOption) => {
                  const selected =
                    icon === iconOption.value;

                  return (
                    <button
                      key={iconOption.value}
                      type="button"
                      onClick={() =>
                        setIcon(
                          iconOption.value,
                        )
                      }
                      aria-pressed={selected}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-xs font-medium transition ${
                        selected
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                      }`}
                    >
                      <AppIcon
                        name={iconOption.value}
                        size={21}
                      />

                      {iconOption.label}
                    </button>
                  );
                },
              )}
            </div>
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-2xl border border-zinc-200 px-5 text-sm font-medium transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear carpeta"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}