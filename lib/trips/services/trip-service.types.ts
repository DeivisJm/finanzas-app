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