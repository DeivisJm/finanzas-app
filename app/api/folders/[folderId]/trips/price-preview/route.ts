import { TripDomainError } from "@/lib/trips/errors/trip-domain-error";
import { previewTripPrice } from "@/lib/trips/services";
import { NextResponse } from "next/server";

interface TripRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

/**
 * Parses and validates a folder identifier.
 */
function parseFolderId(
  value: string,
): number | null {
  const folderId = Number(value);

  return Number.isInteger(folderId) &&
    folderId > 0
    ? folderId
    : null;
}

/**
 * Calculates travel-currency equivalents without persisting anything.
 */
export async function POST(
  request: Request,
  context: TripRouteContext,
) {
  try {
    const { folderId } =
      await context.params;

    const parsedFolderId =
      parseFolderId(folderId);

    if (!parsedFolderId) {
      return NextResponse.json(
        {
          message:
            "El identificador de la carpeta no es válido.",
        },
        {
          status: 400,
        },
      );
    }

    const body: unknown =
      await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("currencyCode" in body) ||
      typeof body.currencyCode !==
        "string" ||
      !("amount" in body)
    ) {
      return NextResponse.json(
        {
          message:
            "Indicá una moneda y un monto válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await previewTripPrice({
        folderId: parsedFolderId,
        currencyCode:
          body.currencyCode,
        amount:
          body.amount as string | number,
      });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (
      error instanceof TripDomainError
    ) {
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
      "Failed to preview trip price:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible calcular la equivalencia.",
      },
      {
        status: 500,
      },
    );
  }
}