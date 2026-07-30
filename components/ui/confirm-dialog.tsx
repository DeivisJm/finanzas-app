"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Displays an accessible confirmation dialog for destructive
 * or sensitive actions.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isDanger = variant === "danger";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isLoading
        ) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full rounded-t-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-md sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
              isDanger
                ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            <AlertTriangle size={23} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex size-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Cerrar confirmación"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-5">
          <h2
            id="confirm-dialog-title"
            className="text-xl font-semibold tracking-tight"
          >
            {title}
          </h2>

          <p
            id="confirm-dialog-description"
            className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
          >
            {description}
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 rounded-2xl border border-zinc-200 px-5 text-sm font-medium transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-11 rounded-2xl px-5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            }`}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}