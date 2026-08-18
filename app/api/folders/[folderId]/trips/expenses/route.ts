import {
  createTripExpense,
  getTripExpenses,
} from "@/lib/trips/services";
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
 * Returns every travel expense registered in the folder.
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

    const expenses =
      await getTripExpenses(parsedFolderId);

    return NextResponse.json(expenses);
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
      "Failed to retrieve trip expenses:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible obtener las compras del viaje.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Registers a travel purchase and its FIFO traceability.
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
      !("amount" in body) ||
      !("description" in body) ||
      typeof body.description !== "string" ||
      !("category" in body) ||
      typeof body.category !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "La información de la compra no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await createTripExpense({
      folderId: parsedFolderId,
      currencyCode: body.currencyCode,
      amount: body.amount as string | number,
      description: body.description,
      category: body.category,
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
      "Failed to create trip expense:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible registrar la compra.",
      },
      {
        status: 500,
      },
    );
  }
}