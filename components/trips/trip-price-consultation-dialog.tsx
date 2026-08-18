"use client";

import { formatTripCurrency } from "@/lib/trips/utils/currency-formatter";
import { previewTripPrice } from "@/services/trip-service";
import type {
  TripAccount,
  TripPricePreview,
} from "@/types/trip";
import {
  Calculator,
  Coins,
  X,
} from "lucide-react";
import { useState } from "react";

interface TripPriceConsultationDialogProps {
  isOpen: boolean;
  folderId: number;
  accounts: TripAccount[];
  baseCurrencyCode: string;
  onClose: () => void;
}

/**
 * Provides a read-only price conversion tool based exclusively
 * on the exchange operations already registered for the trip.
 */
export function TripPriceConsultationDialog({
  isOpen,
  folderId,
  accounts,
  baseCurrencyCode,
  onClose,
}: TripPriceConsultationDialogProps) {
  const availableCurrencies =
    accounts.filter(
      (account) =>
        Number(account.currentBalance) > 0,
    );

  const defaultCurrency =
    availableCurrencies.find(
      (account) =>
        account.currencyCode !==
        baseCurrencyCode,
    )?.currencyCode ??
    availableCurrencies[0]
      ?.currencyCode ??
    baseCurrencyCode;

  const [currencyCode, setCurrencyCode] =
    useState(defaultCurrency);

  const [amount, setAmount] =
    useState("");

  const [result, setResult] =
    useState<TripPricePreview | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [isCalculating, setIsCalculating] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setResult(null);
    setIsCalculating(true);

    try {
      const preview =
        await previewTripPrice(
          folderId,
          {
            currencyCode,
            amount,
          },
        );

      setResult(preview);
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible realizar la consulta.",
      );
    } finally {
      setIsCalculating(false);
    }
  }

  function handleClose(): void {
    setAmount("");
    setResult(null);
    setError("");
    onClose();
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/70 backdrop-blur-md sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget &&
          !isCalculating
        ) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-price-dialog-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-lg sm:rounded-[2rem] sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Calculator size={21} />
            </div>

            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Solo consulta
              </p>

              <h2
                id="trip-price-dialog-title"
                className="mt-1 text-xl font-semibold tracking-tight"
              >
                ¿Cuánto estoy pagando?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Cerrar consulta"
          >
            <X size={19} />
          </button>
        </header>

        <p className="mt-5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Escribí el precio que te están
          ofreciendo. Wallet Pro utilizará
          únicamente los tipos de cambio que
          registraste durante este viaje.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Precio del producto o servicio
            </label>

            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <select
                value={currencyCode}
                onChange={(event) => {
                  setCurrencyCode(
                    event.target.value,
                  );

                  setResult(null);
                }}
                className="h-12 rounded-2xl border border-zinc-200 bg-zinc-100 px-3 outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                {availableCurrencies.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={
                        account.currencyCode
                      }
                    >
                      {
                        account.currencyCode
                      }
                    </option>
                  ),
                )}
              </select>

              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={amount}
                onChange={(event) => {
                  setAmount(
                    event.target.value,
                  );

                  setResult(null);
                }}
                placeholder="Ej. 80000"
                required
                className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isCalculating ||
              !amount
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            <Calculator size={17} />

            {isCalculating
              ? "Calculando..."
              : "Consultar precio"}
          </button>
        </form>

        {result ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-[1.5rem] bg-zinc-950 p-5 text-white dark:bg-zinc-800">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Precio consultado
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {formatTripCurrency(
                  result.quotedAmount,
                  result.quotedCurrencyCode,
                )}
              </p>
            </div>

            {result.intermediateEquivalents.map(
              (equivalent) => (
                <div
                  key={
                    equivalent.currencyCode
                  }
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                      <Coins size={17} />
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Equivalente en
                      </p>

                      <p className="font-medium">
                        {
                          equivalent.currencyCode
                        }
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {formatTripCurrency(
                      equivalent.amount,
                      equivalent.currencyCode,
                    )}
                  </p>
                </div>
              ),
            )}

            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                En tu moneda local
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-950 dark:text-emerald-100">
                {formatTripCurrency(
                  result.equivalentBaseAmount,
                  result.baseCurrencyCode,
                )}
              </p>
            </div>

            <p className="text-center text-xs leading-5 text-zinc-400">
              Esta consulta no modifica tus
              saldos ni registra una compra.
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}