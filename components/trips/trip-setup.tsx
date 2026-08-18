"use client";

import { configureTrip } from "@/services/trip-service";
import { ArrowRight, Coins, Plane } from "lucide-react";
import { useState } from "react";

interface TripSetupProps {
  folderId: number;
  tripName: string;
  onConfigured: () => Promise<void>;
}

/**
 * Configures the base currency used to track the trip's
 * complete financial history.
 */
export function TripSetup({
  folderId,
  tripName,
  onConfigured,
}: TripSetupProps) {
  const [currencyCode, setCurrencyCode] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await configureTrip(folderId, {
        baseCurrencyCode: currencyCode,
      });

      await onConfigured();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible configurar el viaje.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <Plane size={22} />
        </div>

        <p className="mt-6 text-sm font-medium text-sky-600 dark:text-sky-400">
          Configuración inicial
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Prepará {tripName}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Elegí tu moneda base. La utilizaremos para calcular
          cuánto representa realmente cada conversión y cada
          compra durante el viaje.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <label
            htmlFor="base-currency"
            className="mb-2 block text-sm font-medium"
          >
            Moneda base
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Coins
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                id="base-currency"
                value={currencyCode}
                onChange={(event) =>
                  setCurrencyCode(
                    event.target.value
                      .toUpperCase()
                      .slice(0, 3),
                  )
                }
                placeholder="Ej. CRC, USD, EUR"
                minLength={3}
                maxLength={3}
                required
                autoCapitalize="characters"
                className="h-13 w-full rounded-2xl border border-zinc-200 bg-zinc-100 pl-11 pr-4 uppercase outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <button
              type="submit"
              disabled={
                currencyCode.length !== 3 ||
                isSubmitting
              }
              className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              {isSubmitting
                ? "Configurando..."
                : "Comenzar"}

              <ArrowRight size={17} />
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}