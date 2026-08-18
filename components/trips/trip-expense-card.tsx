"use client";

import { createTripExpense } from "@/services/trip-service";
import type { TripAccount } from "@/types/trip";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface TripExpenseCardProps {
  folderId: number;
  accounts: TripAccount[];
  onChanged: () => Promise<void>;
}

const categories = [
  "Alimentación",
  "Hospedaje",
  "Transporte",
  "Tours",
  "Entradas",
  "Compras",
  "Vuelos",
  "Seguro",
  "Otros",
] as const;

/**
 * Registers a purchase using one of the travel wallet currencies.
 */
export function TripExpenseCard({
  folderId,
  accounts,
  onChanged,
}: TripExpenseCardProps) {
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState<string>(categories[0]);
  const [currencyCode, setCurrencyCode] =
    useState(accounts[0]?.currencyCode ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await createTripExpense(folderId, {
        description,
        category,
        currencyCode,
        amount,
      });

      setDescription("");
      setAmount("");

      await onChanged();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible registrar la compra.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
        <ShoppingBag size={20} />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        Registrar compra
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        El gasto conservará automáticamente su costo
        equivalente en la moneda base del viaje.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <input
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Ej. Almuerzo en Bogotá"
          required
          maxLength={120}
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none dark:border-zinc-700 dark:bg-zinc-950"
        >
          {categories.map((currentCategory) => (
            <option
              key={currentCategory}
              value={currentCategory}
            >
              {currentCategory}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <select
            value={currencyCode}
            onChange={(event) =>
              setCurrencyCode(event.target.value)
            }
            required
            className="h-12 rounded-2xl border border-zinc-200 bg-zinc-100 px-3 outline-none dark:border-zinc-700 dark:bg-zinc-950"
          >
            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.currencyCode}
              >
                {account.currencyCode}
              </option>
            ))}
          </select>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="Monto"
            required
            className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {isSubmitting
            ? "Registrando..."
            : "Registrar compra"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}