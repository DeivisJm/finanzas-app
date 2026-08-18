"use client";

import { formatTripCurrency } from "@/lib/trips/utils/currency-formatter";
import { convertTripCurrency } from "@/services/trip-service";
import type { TripAccount } from "@/types/trip";
import {
  ArrowDown,
  ArrowRightLeft,
  Check,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

interface CurrencyConversionCardProps {
  folderId: number;
  baseCurrencyCode: string;
  accounts: TripAccount[];
  onChanged: () => Promise<void>;
}

type ConversionStep = "BASE_TO_BRIDGE" | "BRIDGE_TO_DESTINATION";

/**
 * Handles the two-stage travel currency workflow:
 * base currency -> bridge currency -> destination currency.
 */
export function CurrencyConversionCard({
  folderId,
  baseCurrencyCode,
  accounts,
  onChanged,
}: CurrencyConversionCardProps) {
  const [step, setStep] =
    useState<ConversionStep>("BASE_TO_BRIDGE");

  /*
   * First conversion:
   * Local/base currency -> bridge currency.
   */
  const [bridgeCurrencyCode, setBridgeCurrencyCode] =
    useState("USD");

  const [baseAmount, setBaseAmount] =
    useState("");

  /*
   * Represents how many units of the base currency
   * are required to obtain one unit of the bridge currency.
   *
   * Example:
   * 1 USD = 500 CRC
   */
  const [baseRate, setBaseRate] =
    useState("");

  /*
   * Second conversion:
   * Bridge currency -> destination currency.
   */
  const [
    destinationCurrencyCode,
    setDestinationCurrencyCode,
  ] = useState("");

  const [bridgeAmountToConvert, setBridgeAmountToConvert] =
    useState("");

  /*
   * Represents how many destination currency units
   * are obtained for one bridge currency unit.
   *
   * Example:
   * 1 USD = 3133.54 COP
   */
  const [destinationRate, setDestinationRate] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /**
   * Calculates the amount of bridge currency obtained from
   * the local/base currency.
   *
   * Example:
   * 500000 CRC / 500 CRC per USD = 1000 USD.
   */
  const calculatedBridgeAmount =
    useMemo(() => {
      const amount = Number(baseAmount);
      const rate = Number(baseRate);

      if (
        !Number.isFinite(amount) ||
        !Number.isFinite(rate) ||
        amount <= 0 ||
        rate <= 0
      ) {
        return null;
      }

      return amount / rate;
    }, [baseAmount, baseRate]);

  /**
   * Finds the currently available balance for the bridge
   * currency after a previous conversion.
   */
  const bridgeAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.currencyCode ===
          bridgeCurrencyCode,
      ),
    [accounts, bridgeCurrencyCode],
  );

  const bridgeAvailableBalance =
    Number(
      bridgeAccount?.currentBalance ?? 0,
    );

  /**
   * Calculates how much destination currency will be received.
   *
   * Example:
   * 1000 USD * 3133.54 COP per USD = 3,133,540 COP.
   */
  const calculatedDestinationAmount =
    useMemo(() => {
      const amount = Number(
        bridgeAmountToConvert,
      );

      const rate = Number(destinationRate);

      if (
        !Number.isFinite(amount) ||
        !Number.isFinite(rate) ||
        amount <= 0 ||
        rate <= 0
      ) {
        return null;
      }

      return amount * rate;
    }, [
      bridgeAmountToConvert,
      destinationRate,
    ]);

  function clearMessages(): void {
    setError("");
    setSuccessMessage("");
  }

  /**
   * Saves the conversion from the trip's base currency
   * to the selected bridge currency.
   */
  async function saveBaseConversion(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    clearMessages();

    if (!calculatedBridgeAmount) {
      setError(
        "Indicá un monto y un tipo de cambio válidos.",
      );

      return;
    }

    if (
      bridgeCurrencyCode ===
      baseCurrencyCode
    ) {
      setError(
        "La moneda que vas a recibir debe ser diferente de tu moneda base.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await convertTripCurrency(folderId, {
        fromCurrencyCode:
          baseCurrencyCode,

        toCurrencyCode:
          bridgeCurrencyCode,

        fromAmount:
          baseAmount,

        toAmount:
          calculatedBridgeAmount.toString(),
      });

      setSuccessMessage(
        `Conversión registrada: ${formatTripCurrency(
          baseAmount,
          baseCurrencyCode,
        )} → ${formatTripCurrency(
          calculatedBridgeAmount,
          bridgeCurrencyCode,
        )}.`,
      );

      setBaseAmount("");
      setBaseRate("");

      await onChanged();

      setStep(
        "BRIDGE_TO_DESTINATION",
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible guardar la conversión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Saves the conversion from the bridge currency
   * to the destination currency.
   */
  async function saveDestinationConversion(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    clearMessages();

    if (!calculatedDestinationAmount) {
      setError(
        "Indicá el monto que vas a cambiar y el tipo de cambio obtenido.",
      );

      return;
    }

    const bridgeAmount = Number(
      bridgeAmountToConvert,
    );

    if (
      bridgeAmount >
      bridgeAvailableBalance
    ) {
      setError(
        `No tenés suficiente saldo disponible en ${bridgeCurrencyCode}.`,
      );

      return;
    }

    if (
      destinationCurrencyCode ===
      bridgeCurrencyCode
    ) {
      setError(
        "La moneda de destino debe ser diferente de la moneda que vas a cambiar.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await convertTripCurrency(folderId, {
        fromCurrencyCode:
          bridgeCurrencyCode,

        toCurrencyCode:
          destinationCurrencyCode,

        fromAmount:
          bridgeAmountToConvert,

        toAmount:
          calculatedDestinationAmount.toString(),
      });

      setSuccessMessage(
        `Conversión registrada: ${formatTripCurrency(
          bridgeAmountToConvert,
          bridgeCurrencyCode,
        )} → ${formatTripCurrency(
          calculatedDestinationAmount,
          destinationCurrencyCode,
        )}.`,
      );

      setBridgeAmountToConvert("");
      setDestinationRate("");

      await onChanged();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible guardar la conversión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
          <ArrowRightLeft size={20} />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Cambio de moneda
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Registrá el tipo de cambio que realmente
          conseguiste. Wallet Pro calculará
          automáticamente cuánto dinero recibís.
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() =>
              setStep(
                "BASE_TO_BRIDGE",
              )
            }
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              step === "BASE_TO_BRIDGE"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Cambio inicial
          </button>

          <button
            type="button"
            onClick={() =>
              setStep(
                "BRIDGE_TO_DESTINATION",
              )
            }
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              step ===
              "BRIDGE_TO_DESTINATION"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            En el destino
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {step === "BASE_TO_BRIDGE" ? (
          <form
            onSubmit={saveBaseConversion}
            className="space-y-5"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Paso 1
              </p>

              <h3 className="mt-1 font-semibold">
                Cambiá tu moneda local
              </h3>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                ¿Cuánto dinero querés cambiar?
              </label>

              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <div className="flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-950">
                  {baseCurrencyCode}
                </div>

                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={baseAmount}
                  onChange={(event) =>
                    setBaseAmount(
                      event.target.value,
                    )
                  }
                  placeholder="500000"
                  required
                  className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Moneda que vas a recibir
              </label>

              <input
                value={bridgeCurrencyCode}
                onChange={(event) =>
                  setBridgeCurrencyCode(
                    event.target.value
                      .toUpperCase()
                      .slice(0, 3),
                  )
                }
                minLength={3}
                maxLength={3}
                required
                placeholder="USD"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 uppercase outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/25">
              <label className="block text-sm font-semibold">
                ¿A cuánto conseguiste el cambio?
              </label>

              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Indicá cuánto cuesta 1{" "}
                {bridgeCurrencyCode || "USD"} en{" "}
                {baseCurrencyCode}.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="shrink-0 text-sm font-medium">
                  1{" "}
                  {bridgeCurrencyCode ||
                    "USD"}{" "}
                  =
                </div>

                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={baseRate}
                  onChange={(event) =>
                    setBaseRate(
                      event.target.value,
                    )
                  }
                  placeholder="500"
                  required
                  className="h-11 min-w-0 flex-1 rounded-xl border border-sky-200 bg-white px-3 outline-none dark:border-sky-900 dark:bg-zinc-950"
                />

                <span className="text-sm font-medium">
                  {baseCurrencyCode}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <ArrowDown size={17} />
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-800">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Recibirías
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {calculatedBridgeAmount
                  ? formatTripCurrency(
                      calculatedBridgeAmount,
                      bridgeCurrencyCode,
                    )
                  : `0 ${bridgeCurrencyCode}`}
              </p>

              {calculatedBridgeAmount ? (
                <p className="mt-2 text-xs text-zinc-400">
                  {formatTripCurrency(
                    baseAmount,
                    baseCurrencyCode,
                  )}{" "}
                  ÷ {baseRate} ={" "}
                  {formatTripCurrency(
                    calculatedBridgeAmount,
                    bridgeCurrencyCode,
                  )}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !calculatedBridgeAmount
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              <Check size={17} />

              {isSubmitting
                ? "Guardando..."
                : "Confirmar cambio"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={
              saveDestinationConversion
            }
            className="space-y-5"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Paso 2
              </p>

              <h3 className="mt-1 font-semibold">
                Cambiá dinero en tu destino
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Utilizá la moneda que ya tenés
                disponible para obtener la moneda
                del lugar que estás visitando.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Moneda que vas a cambiar
              </label>

              <select
                value={bridgeCurrencyCode}
                onChange={(event) => {
                  setBridgeCurrencyCode(
                    event.target.value,
                  );

                  setBridgeAmountToConvert(
                    "",
                  );
                }}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                {accounts
                  .filter(
                    (account) =>
                      account.currencyCode !==
                      baseCurrencyCode,
                  )
                  .map((account) => (
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
                  ))}
              </select>

              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Disponible:{" "}
                {formatTripCurrency(
                  bridgeAvailableBalance,
                  bridgeCurrencyCode,
                )}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                ¿Cuánto querés cambiar?
              </label>

              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                max={
                  bridgeAvailableBalance ||
                  undefined
                }
                value={
                  bridgeAmountToConvert
                }
                onChange={(event) =>
                  setBridgeAmountToConvert(
                    event.target.value,
                  )
                }
                placeholder="1000"
                required
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
              />

              {bridgeAvailableBalance >
              0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setBridgeAmountToConvert(
                      String(
                        bridgeAvailableBalance,
                      ),
                    )
                  }
                  className="mt-2 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  Usar todo el saldo
                </button>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Moneda del destino
              </label>

              <input
                value={
                  destinationCurrencyCode
                }
                onChange={(event) =>
                  setDestinationCurrencyCode(
                    event.target.value
                      .toUpperCase()
                      .slice(0, 3),
                  )
                }
                placeholder="COP"
                minLength={3}
                maxLength={3}
                required
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 uppercase outline-none focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/25">
              <label className="block text-sm font-semibold">
                ¿A cuánto está el cambio?
              </label>

              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Indicá cuánto recibís en{" "}
                {destinationCurrencyCode ||
                  "la moneda destino"}{" "}
                por cada 1{" "}
                {bridgeCurrencyCode}.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="shrink-0 text-sm font-medium">
                  1 {bridgeCurrencyCode} =
                </div>

                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={destinationRate}
                  onChange={(event) =>
                    setDestinationRate(
                      event.target.value,
                    )
                  }
                  placeholder="3133.54"
                  required
                  className="h-11 min-w-0 flex-1 rounded-xl border border-sky-200 bg-white px-3 outline-none dark:border-sky-900 dark:bg-zinc-950"
                />

                <span className="text-sm font-medium">
                  {destinationCurrencyCode ||
                    "---"}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <ArrowDown size={17} />
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-800">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                Recibirías en tu destino
              </p>

              <p className="mt-2 break-words text-2xl font-semibold tracking-tight">
                {calculatedDestinationAmount
                  ? formatTripCurrency(
                      calculatedDestinationAmount,
                      destinationCurrencyCode,
                    )
                  : `0 ${
                      destinationCurrencyCode ||
                      ""
                    }`}
              </p>

              {calculatedDestinationAmount ? (
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  {formatTripCurrency(
                    bridgeAmountToConvert,
                    bridgeCurrencyCode,
                  )}{" "}
                  × {destinationRate} ={" "}
                  {formatTripCurrency(
                    calculatedDestinationAmount,
                    destinationCurrencyCode,
                  )}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !calculatedDestinationAmount
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              <Check size={17} />

              {isSubmitting
                ? "Guardando..."
                : "Confirmar cambio"}
            </button>
          </form>
        )}

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
      </div>
    </section>
  );
}