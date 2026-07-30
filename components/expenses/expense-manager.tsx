"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/formatters";
import type { Expense } from "@/types/expense";
import {
  Check,
  CheckCheck,
  Download,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ExpenseManagerProps {
  folderId: number;
  initialExpenses: Expense[];
}

interface ExpenseFormState {
  text: string;
}

interface EditFormState {
  description: string;
  amount: string;
}

/**
 * Returns the current local date in YYYY-MM-DD format.
 */
function getLocalDate(): string {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 10);
}

function formatExpenseDate(value: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

/**
 * Downloads the response returned by an export endpoint.
 */
async function downloadTextFile(
  endpoint: string,
): Promise<void> {
  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ??
        "No fue posible exportar los pagos.",
    );
  }

  const blob = await response.blob();

  const disposition =
    response.headers.get("Content-Disposition") ?? "";

  const fileNameMatch = disposition.match(
    /filename="?([^"]+)"?/i,
  );

  const fileName =
    fileNameMatch?.[1] ?? "gastos-pagados.txt";

  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(downloadUrl);
}

/**
 * Handles the complete pending-expense workflow.
 */
export function ExpenseManager({
  folderId,
  initialExpenses,
}: ExpenseManagerProps) {
  const [expenses, setExpenses] =
    useState<Expense[]>(initialExpenses);

  const [form, setForm] = useState<ExpenseFormState>({
    text: "",
  });

  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [editForm, setEditForm] =
    useState<EditFormState>({
      description: "",
      amount: "",
    });

  const [expenseToDelete, setExpenseToDelete] =
    useState<Expense | null>(null);

  const [isPayAndExportOpen, setIsPayAndExportOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const pendingAmount = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    );
  }, [expenses]);

  function clearMessages(): void {
    setError("");
    setSuccessMessage("");
  }

  async function createExpense(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/folders/${folderId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: form.text,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible registrar el gasto.",
        );
      }

      setExpenses((currentExpenses) => [
        result,
        ...currentExpenses,
      ]);

      setForm({
        text: "",
      });

      setSuccessMessage(
        "El gasto fue registrado correctamente.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible registrar el gasto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditDialog(expense: Expense): void {
    clearMessages();
    setEditingExpense(expense);

    setEditForm({
      description: expense.description,
      amount: String(expense.amount),
    });
  }

  async function updateExpense(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!editingExpense) {
      return;
    }

    clearMessages();
    setProcessingId(editingExpense.id);

    try {
      const response = await fetch(
        `/api/folders/${folderId}/expenses/${editingExpense.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: editForm.description,
            amount: Number(editForm.amount),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible actualizar el gasto.",
        );
      }

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === result.id ? result : expense,
        ),
      );

      setEditingExpense(null);

      setSuccessMessage(
        "El gasto fue actualizado correctamente.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible actualizar el gasto.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function payExpense(
    expense: Expense,
  ): Promise<void> {
    clearMessages();
    setProcessingId(expense.id);

    try {
      const response = await fetch(
        `/api/folders/${folderId}/expenses/${expense.id}/pay`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible marcar el gasto como pagado.",
        );
      }

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (currentExpense) =>
            currentExpense.id !== expense.id,
        ),
      );

      setSuccessMessage(
        "El gasto fue pagado. Ya está disponible en la exportación de hoy.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible marcar el gasto como pagado.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteExpense(): Promise<void> {
    if (!expenseToDelete) {
      return;
    }

    clearMessages();
    setProcessingId(expenseToDelete.id);

    try {
      const response = await fetch(
        `/api/folders/${folderId}/expenses/${expenseToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible eliminar el gasto.",
        );
      }

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) =>
            expense.id !== expenseToDelete.id,
        ),
      );

      setExpenseToDelete(null);
      setSuccessMessage(
        "El gasto fue eliminado correctamente.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible eliminar el gasto.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function exportTodayPayments(): Promise<void> {
    clearMessages();
    setIsSubmitting(true);

    try {
      const currentDate = getLocalDate();

      await downloadTextFile(
        `/api/folders/${folderId}/expenses/export?date=${currentDate}`,
      );

      setSuccessMessage(
        "El archivo con los pagos de hoy fue descargado.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible exportar los pagos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function payAndExport(): Promise<void> {
    clearMessages();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/folders/${folderId}/expenses/pay-all`,
        {
          method: "PATCH",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "No fue posible pagar los gastos.",
        );
      }

      setExpenses([]);
      setIsPayAndExportOpen(false);

      const currentDate = getLocalDate();

      await downloadTextFile(
        `/api/folders/${folderId}/expenses/export?date=${currentDate}`,
      );

      setSuccessMessage(
        "Los gastos fueron pagados y el reporte de hoy fue descargado.",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible pagar y exportar los gastos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="rounded-[2rem] border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Registro rápido
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Agregar un gasto
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              La fecha se registra automáticamente. Escribí el monto y el nombre del lugar
              donde realizaste el gasto.
            </p>

            <form
              onSubmit={createExpense}
              className="mt-6"
            >
              <label
                htmlFor="expense-text"
                className="mb-2 block text-sm font-medium"
              >
                Monto y lugar del gasto
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="expense-text"
                  type="text"
                  value={form.text}
                  onChange={(event) =>
                    setForm({
                      text: event.target.value,
                    })
                  }
                  placeholder="Escribí aquí el gasto generado"
                  required
                  maxLength={150}
                  className="h-12 min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-indigo-400 dark:focus:bg-zinc-950"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  <Plus size={18} />
                  {isSubmitting
                    ? "Guardando..."
                    : "Registrar gasto"}
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={() =>
                setIsPayAndExportOpen(true)
              }
              disabled={
                expenses.length === 0 || isSubmitting
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              <CheckCheck size={18} />
              Pagar y exportar
            </button>

            <button
              type="button"
              onClick={exportTodayPayments}
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-100 px-5 text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
            >
              <Download size={18} />
              Exportar pagos de hoy
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">
            Pendientes:
            <strong className="ml-2 font-semibold text-zinc-950 dark:text-white">
              {expenses.length}
            </strong>
          </span>

          <span className="text-zinc-500 dark:text-zinc-400">
            Total actual:
            <strong className="ml-2 font-semibold text-zinc-950 dark:text-white">
              {formatCurrency(pendingAmount)}
            </strong>
          </span>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </p>
      ) : null}

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Movimientos activos
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Gastos pendientes
          </h2>
        </div>

        {expenses.length > 0 ? (
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {expenses.map((expense, index) => (
              <article
                key={expense.id}
                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  index > 0
                    ? "border-t border-zinc-200 dark:border-zinc-800"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <ReceiptText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">
                      {expense.description}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatExpenseDate(
                        expense.expenseDate,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="mr-2 text-lg font-semibold">
                    {formatCurrency(expense.amount)}
                  </p>

                  <button
                    type="button"
                    onClick={() => payExpense(expense)}
                    disabled={processingId === expense.id}
                    className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                    title="Pagar"
                    aria-label="Pagar gasto"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditDialog(expense)}
                    disabled={processingId === expense.id}
                    className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    title="Editar"
                    aria-label="Editar gasto"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setExpenseToDelete(expense)
                    }
                    disabled={processingId === expense.id}
                    className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400"
                    title="Eliminar"
                    aria-label="Eliminar gasto"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
            <ReceiptText
              className="mx-auto text-zinc-400"
              size={34}
            />

            <h3 className="mt-4 font-semibold">
              No hay gastos pendientes
            </h3>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Los gastos que registrés aparecerán en esta sección.
            </p>
          </div>
        )}
      </section>

      {editingExpense ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="w-full rounded-t-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-lg sm:rounded-[2rem]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Movimiento
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Editar gasto
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Cerrar edición"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={updateExpense}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Descripción
                </label>

                <input
                  id="edit-description"
                  type="text"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }))
                  }
                  required
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-amount"
                  className="mb-2 block text-sm font-medium"
                >
                  Monto
                </label>

                <input
                  id="edit-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={editForm.amount}
                  onChange={(event) =>
                    setEditForm((currentForm) => ({
                      ...currentForm,
                      amount: event.target.value,
                    }))
                  }
                  required
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <button
                type="submit"
                disabled={
                  processingId === editingExpense.id
                }
                className="h-12 w-full rounded-2xl bg-indigo-600 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Guardar cambios
              </button>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        title="Eliminar gasto"
        description={`¿Seguro que querés eliminar “${
          expenseToDelete?.description ?? ""
        }”? Este movimiento se eliminará permanentemente.`}
        confirmLabel="Eliminar gasto"
        variant="danger"
        isLoading={
          processingId === expenseToDelete?.id
        }
        onCancel={() => setExpenseToDelete(null)}
        onConfirm={deleteExpense}
      />

      <ConfirmDialog
        isOpen={isPayAndExportOpen}
        title="Pagar y exportar"
        description={`Se marcarán como pagados los ${expenses.length} movimientos pendientes. Después se descargará un reporte con todos los gastos pagados durante el día de hoy.`}
        confirmLabel="Pagar y descargar"
        isLoading={isSubmitting}
        onCancel={() =>
          setIsPayAndExportOpen(false)
        }
        onConfirm={payAndExport}
      />
    </>
  );
}