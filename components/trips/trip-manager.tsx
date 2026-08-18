"use client";

import { CurrencyConversionCard } from "@/components/trips/currency-conversion-card";
import { TripBalanceGrid } from "@/components/trips/trip-balance-grid";
import { TripExpenseCard } from "@/components/trips/trip-expense-card";
import { TripFundingCard } from "@/components/trips/trip-funding-card";
import { TripPriceConsultationDialog } from "@/components/trips/trip-price-consultation-dialog";
import { TripSetup } from "@/components/trips/trip-setup";
import { formatTripCurrency } from "@/lib/trips/utils/currency-formatter";
import {
  getTripBalances,
  getTripExpenses,
  getTripSettings,
} from "@/services/trip-service";
import type {
  TripAccount,
  TripExpenseItem,
  TripSettings,
} from "@/types/trip";
import {
  Calculator,
  LoaderCircle,
  ReceiptText,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

interface TripManagerProps {
  folderId: number;
  tripName: string;
}

interface TripData {
  settings: TripSettings;
  accounts: TripAccount[];
  expenses: TripExpenseItem[];
}

/**
 * Coordinates the complete financial workflow of a travel folder.
 */
export function TripManager({
  folderId,
  tripName,
}: TripManagerProps) {
  const [tripData, setTripData] =
    useState<TripData | null>(null);

  const [isConfigured, setIsConfigured] =
    useState<boolean | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isPriceConsultationOpen,
    setIsPriceConsultationOpen,
  ] = useState(false);

  const [error, setError] = useState("");

  /**
   * Retrieves the complete financial state of the trip.
   */
  const refreshTrip =
    useCallback(async (): Promise<void> => {
      try {
        const settings =
          await getTripSettings(folderId);

        const [
          balancesResponse,
          expensesResponse,
        ] = await Promise.all([
          getTripBalances(folderId),
          getTripExpenses(folderId),
        ]);

        setTripData({
          settings,
          accounts: balancesResponse.accounts,
          expenses: expensesResponse.expenses,
        });

        setIsConfigured(true);
        setError("");
      } catch (caughtError: unknown) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "No fue posible cargar la información del viaje.";

        if (
          message.includes(
            "todavía no tiene una configuración",
          )
        ) {
          setTripData(null);
          setIsConfigured(false);
          setError("");

          return;
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [folderId]);

  /**
   * Loads the initial travel state after the component mounts.
   */
  useEffect(() => {
    let isCancelled = false;

    async function initializeTrip(): Promise<void> {
      try {
        const settings =
          await getTripSettings(folderId);

        const [
          balancesResponse,
          expensesResponse,
        ] = await Promise.all([
          getTripBalances(folderId),
          getTripExpenses(folderId),
        ]);

        if (isCancelled) {
          return;
        }

        setTripData({
          settings,
          accounts: balancesResponse.accounts,
          expenses: expensesResponse.expenses,
        });

        setIsConfigured(true);
        setError("");
      } catch (caughtError: unknown) {
        if (isCancelled) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "No fue posible cargar la información del viaje.";

        if (
          message.includes(
            "todavía no tiene una configuración",
          )
        ) {
          setTripData(null);
          setIsConfigured(false);
          setError("");

          return;
        }

        setError(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void initializeTrip();

    return () => {
      isCancelled = true;
    };
  }, [folderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-52 items-center justify-center">
        <LoaderCircle
          className="animate-spin text-zinc-400"
          size={28}
        />
      </div>
    );
  }

  if (isConfigured === false) {
    return (
      <TripSetup
        folderId={folderId}
        tripName={tripName}
        onConfigured={refreshTrip}
      />
    );
  }

  if (!tripData) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error ||
          "No fue posible cargar la configuración del viaje."}
      </p>
    );
  }

  const {
    settings,
    accounts,
    expenses,
  } = tripData;

  return (
    <>
      <div className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Herramientas rápidas
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Consulta antes de comprar
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsPriceConsultationOpen(true)
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
          >
            <Calculator size={17} />
            Consultar precio
          </button>
        </div>

        <TripBalanceGrid
          accounts={accounts}
          baseCurrencyCode={
            settings.baseCurrencyCode
          }
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <TripFundingCard
            folderId={folderId}
            baseCurrencyCode={
              settings.baseCurrencyCode
            }
            onChanged={refreshTrip}
          />

          <CurrencyConversionCard
            folderId={folderId}
            baseCurrencyCode={
              settings.baseCurrencyCode
            }
            accounts={accounts}
            onChanged={refreshTrip}
          />

          <TripExpenseCard
            folderId={folderId}
            accounts={accounts}
            onChanged={refreshTrip}
          />
        </div>

        <section>
          <div className="mb-5">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Actividad del viaje
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Compras recientes
            </h2>
          </div>

          {expenses.length > 0 ? (
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {expenses.map(
                (expense, index) => (
                  <article
                    key={expense.id}
                    className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                      index > 0
                        ? "border-t border-zinc-200 dark:border-zinc-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                        <ReceiptText size={19} />
                      </div>

                      <div>
                        <p className="font-medium">
                          {expense.description}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {expense.category}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold">
                        {formatTripCurrency(
                          expense.amount,
                          expense.currencyCode,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        ≈{" "}
                        {formatTripCurrency(
                          expense.equivalentBaseAmount,
                          settings.baseCurrencyCode,
                        )}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
              <ReceiptText
                size={32}
                className="mx-auto text-zinc-400"
              />

              <h3 className="mt-4 font-semibold">
                Todavía no hay compras
              </h3>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Las compras realizadas durante el viaje aparecerán aquí.
              </p>
            </div>
          )}
        </section>
      </div>

      <TripPriceConsultationDialog
        isOpen={isPriceConsultationOpen}
        folderId={folderId}
        accounts={accounts}
        baseCurrencyCode={
          settings.baseCurrencyCode
        }
        onClose={() =>
          setIsPriceConsultationOpen(false)
        }
      />
    </>
  );
}