"use client";

import { addTripFunding } from "@/services/trip-service";
import { CircleDollarSign, Plus } from "lucide-react";
import { useState } from "react";

interface TripFundingCardProps {
  folderId: number;
  baseCurrencyCode: string;
  onChanged: () => Promise<void>;
}

/**
 * Adds available money to the travel wallet.
 */
export function TripFundingCard({
  folderId,
  baseCurrencyCode,
  onChanged,
}: TripFundingCardProps) {
  const [currencyCode, setCurrencyCode] =
    useState(baseCurrencyCode);
  const [amount, setAmount] = useState("");
  const [baseAmount, setBaseAmount] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  const requiresBaseEquivalent =
    currencyCode.length === 3 &&
    currencyCode !== baseCurrencyCode;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await addTripFunding(folderId, {
        currencyCode,
        amount,
        baseCurrencyAmount:
          requiresBaseEquivalent
            ? baseAmount
            : undefined,
      });

      setAmount("");
      setBaseAmount("");

      await onChanged();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible agregar los fondos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
        <CircleDollarSign size={20} />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        Agregar fondos
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Registrá dinero disponible de tu moneda local antes de realizar
        conversiones o compras.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <input
            value={currencyCode}
            onChange={(event) =>
              setCurrencyCode(
                event.target.value
                  .toUpperCase()
                  .slice(0, 3),
              )
            }
            maxLength={3}
            minLength={3}
            required
            aria-label="Moneda"
            className="h-12 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 uppercase outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
          />

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
            className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {requiresBaseEquivalent ? (
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">
              ¿Cuánto representan esos fondos en{" "}
              {baseCurrencyCode}?
            </label>

            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={baseAmount}
              onChange={(event) =>
                setBaseAmount(event.target.value)
              }
              placeholder={`Equivalente en ${baseCurrencyCode}`}
              required
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          <Plus size={17} />

          {isSubmitting
            ? "Agregando..."
            : "Agregar fondos"}
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