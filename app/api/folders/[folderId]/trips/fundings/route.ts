import { addTripFunding } from "@/lib/trips/services";
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
 * Adds initial funds to a travel currency account.
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
      !("currencyCode" in body) ||
      typeof body.currencyCode !== "string" ||
      !("amount" in body)
    ) {
      return NextResponse.json(
        {
          message:
            "La información de los fondos no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await addTripFunding({
      folderId: parsedFolderId,
      currencyCode: body.currencyCode,
      amount: body.amount as string | number,
      baseCurrencyAmount:
        "baseCurrencyAmount" in body
          ? (body.baseCurrencyAmount as string | number | null)
          : undefined,
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
      "Failed to add trip funding:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible agregar los fondos.",
      },
      {
        status: 500,
      },
    );
  }
}