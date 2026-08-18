import type {
  ApiErrorResponse,
  TripBalancesResponse,
  TripExpensesResponse,
  TripSettings,
  TripPricePreview,
} from "@/types/trip";

interface ConfigureTripInput {
  baseCurrencyCode: string;
}

interface AddFundingInput {
  currencyCode: string;
  amount: string;
  baseCurrencyAmount?: string;
  note?: string;
}

interface ConvertCurrencyInput {
  fromCurrencyCode: string;
  toCurrencyCode: string;
  fromAmount: string;
  toAmount: string;
  note?: string;
}

interface CreateTripExpenseInput {
  currencyCode: string;
  amount: string;
  description: string;
  category: string;
  note?: string;
}

/**
 * Resolves API errors into a consistent application error.
 */
async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const data = (await response.json()) as
    | T
    | ApiErrorResponse;

  if (!response.ok) {
    const error = data as ApiErrorResponse;

    throw new Error(
      error.message ?? "No fue posible completar la operación.",
    );
  }

  return data as T;
}

/**
 * Retrieves the financial configuration of a travel folder.
 */
export async function getTripSettings(
  folderId: number,
): Promise<TripSettings> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/settings`,
    {
      cache: "no-store",
    },
  );

  return parseResponse<TripSettings>(response);
}

/**
 * Creates the initial financial configuration for a travel folder.
 */
export async function configureTrip(
  folderId: number,
  input: ConfigureTripInput,
): Promise<TripSettings> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/settings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return parseResponse<TripSettings>(response);
}

/**
 * Retrieves every currently available currency balance.
 */
export async function getTripBalances(
  folderId: number,
): Promise<TripBalancesResponse> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/balances`,
    {
      cache: "no-store",
    },
  );

  return parseResponse<TripBalancesResponse>(response);
}

/**
 * Adds money to a currency balance.
 */
export async function addTripFunding(
  folderId: number,
  input: AddFundingInput,
): Promise<void> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/fundings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  await parseResponse(response);
}

/**
 * Registers a manual currency conversion.
 */
export async function convertTripCurrency(
  folderId: number,
  input: ConvertCurrencyInput,
): Promise<void> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/conversions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  await parseResponse(response);
}

/**
 * Retrieves travel purchases registered in the folder.
 */
export async function getTripExpenses(
  folderId: number,
): Promise<TripExpensesResponse> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/expenses`,
    {
      cache: "no-store",
    },
  );

  return parseResponse<TripExpensesResponse>(response);
}

/**
 * Registers a purchase using an available travel currency.
 */
export async function createTripExpense(
  folderId: number,
  input: CreateTripExpenseInput,
): Promise<void> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/expenses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  await parseResponse(response);
}

interface PreviewTripPriceInput {
  currencyCode: string;
  amount: string;
}

/**
 * Calculates currency equivalents without recording a purchase.
 */
export async function previewTripPrice(
  folderId: number,
  input: PreviewTripPriceInput,
): Promise<TripPricePreview> {
  const response = await fetch(
    `/api/folders/${folderId}/trips/price-preview`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  return parseResponse<TripPricePreview>(
    response,
  );
}