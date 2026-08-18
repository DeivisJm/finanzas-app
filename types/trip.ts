export interface TripAccount {
  id: number;
  currencyCode: string;
  currentBalance: string;
  updatedAt: string;
}

export interface TripSettings {
  id: number;
  folderId: number;
  baseCurrencyCode: string;
  accounts: TripAccount[];
}

export interface TripBalancesResponse {
  baseCurrencyCode: string;
  accounts: TripAccount[];
}

export interface TripExpenseItem {
  id: number;
  description: string;
  category: string;
  currencyCode: string;
  amount: string;
  equivalentBaseAmount: string;
  expenseDate: string;
  note: string | null;
}

export interface TripExpensesResponse {
  baseCurrencyCode: string;
  expenses: TripExpenseItem[];
}

export interface ApiErrorResponse {
  message?: string;
  code?: string;
}

export interface TripPriceEquivalent {
  currencyCode: string;
  amount: string;
}

export interface TripPricePreview {
  quotedCurrencyCode: string;
  quotedAmount: string;

  baseCurrencyCode: string;
  equivalentBaseAmount: string;

  intermediateEquivalents:
    TripPriceEquivalent[];
}