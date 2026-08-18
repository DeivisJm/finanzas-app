import { formatTripCurrency } from "@/lib/trips/utils/currency-formatter";
import type { TripAccount } from "@/types/trip";
import { Landmark, WalletCards } from "lucide-react";

interface TripBalanceGridProps {
  accounts: TripAccount[];
  baseCurrencyCode: string;
}

/**
 * Displays every currency currently held by the traveler.
 */
export function TripBalanceGrid({
  accounts,
  baseCurrencyCode,
}: TripBalanceGridProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Billetera del viaje
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Saldos disponibles
          </h2>
        </div>

        <WalletCards
          size={22}
          className="text-zinc-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const isBase =
            account.currencyCode === baseCurrencyCode;

          return (
            <article
              key={account.id}
              className="relative overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  isBase
                    ? "bg-sky-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />

              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Landmark size={18} />
                </div>

                {isBase ? (
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    Base
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {account.currencyCode}
              </p>

              <p className="mt-1 break-words text-2xl font-semibold tracking-tight">
                {formatTripCurrency(
                  account.currentBalance,
                  account.currencyCode,
                )}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}