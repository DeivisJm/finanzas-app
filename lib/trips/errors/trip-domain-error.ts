export type TripDomainErrorCode =
  | "INVALID_AMOUNT"
  | "INVALID_CURRENCY"
  | "TRIP_NOT_FOUND"
  | "TRIP_ALREADY_CONFIGURED"
  | "PROJECT_NOT_TRIP"
  | "ACCOUNT_NOT_FOUND"
  | "INSUFFICIENT_BALANCE"
  | "INVALID_CONVERSION"
  | "DATABASE_ERROR";

export class TripDomainError extends Error {
  public readonly code: TripDomainErrorCode;
  public readonly statusCode: number;

  constructor(
    code: TripDomainErrorCode,
    message: string,
    statusCode = 400,
  ) {
    super(message);

    this.name = "TripDomainError";
    this.code = code;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, TripDomainError.prototype);
  }
}