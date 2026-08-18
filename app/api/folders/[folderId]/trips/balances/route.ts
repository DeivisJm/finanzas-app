import { getTripBalances } from "@/lib/trips/services";
import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import { NextResponse } from "next/server";

interface TripRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

/**
 * Parses and validates a numeric folder identifier.
 */
function parseFolderId(value: string): number | null {
  const folderId = Number(value);

  return Number.isInteger(folderId) && folderId > 0
    ? folderId
    : null;
}

/**
 * Returns every available currency balance inside a trip.
 */
export async function GET(
  _request: Request,
  context: TripRouteContext,
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = parseFolderId(folderId);

    if (!parsedFolderId) {
      return NextResponse.json(
        {
          message: "El identificador de la carpeta no es válido.",
        },
        {
          status: 400,
        },
      );
    }

    const balances =
      await getTripBalances(parsedFolderId);

    return NextResponse.json(balances);
  } catch (error: unknown) {
    if (error instanceof TripDomainError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
        },
        {
          status: error.statusCode,
        },
      );
    }

    console.error(
      "Failed to retrieve trip balances:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible obtener los saldos del viaje.",
      },
      {
        status: 500,
      },
    );
  }
}