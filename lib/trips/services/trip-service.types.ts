import type { DecimalInput } from "@/lib/trips/utils/decimal";

export interface ConfigureTripInput {
  folderId: number;
  baseCurrencyCode: string;
}

export interface AddTripFundingInput {
  folderId: number;
  currencyCode: string;
  amount: DecimalInput;
  baseCurrencyAmount?: DecimalInput | null;
  note?: string | null;
  fundingDate?: Date;
}

export interface ConvertCurrencyInput {
  folderId: number;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  fromAmount: DecimalInput;
  toAmount: DecimalInput;
  note?: string | null;
  conversionDate?: Date;
}

export interface CreateTripExpenseInput {
  folderId: number;
  currencyCode: string;
  amount: DecimalInput;
  description: string;
  category: string;
  note?: string | null;
  expenseDate?: Date;
}

export interface PreviewTripPriceInput {
  folderId: number;
  currencyCode: string;
  amount: DecimalInput;
}