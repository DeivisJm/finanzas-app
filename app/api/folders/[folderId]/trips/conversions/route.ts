import { convertTripCurrency } from "@/lib/trips/services";
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
 * Registers a manual currency conversion.
 */
export async function POST(
  request: Request,
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

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("fromCurrencyCode" in body) ||
      typeof body.fromCurrencyCode !== "string" ||
      !("toCurrencyCode" in body) ||
      typeof body.toCurrencyCode !== "string" ||
      !("fromAmount" in body) ||
      !("toAmount" in body)
    ) {
      return NextResponse.json(
        {
          message:
            "La información de la conversión no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await convertTripCurrency({
      folderId: parsedFolderId,
      fromCurrencyCode: body.fromCurrencyCode,
      toCurrencyCode: body.toCurrencyCode,
      fromAmount: body.fromAmount as string | number,
      toAmount: body.toAmount as string | number,
      note:
        "note" in body && typeof body.note === "string"
          ? body.note
          : null,
    });

    return NextResponse.json(result, {
      status: 201,
    });
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
      "Failed to convert trip currency:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible registrar la conversión.",
      },
      {
        status: 500,
      },
    );
  }
}