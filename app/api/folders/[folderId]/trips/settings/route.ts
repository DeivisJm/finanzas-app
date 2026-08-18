import {
  configureTrip,
  getTripSettingsByFolderId,
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
 * Returns the financial configuration for a travel folder.
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

    const settings =
      await getTripSettingsByFolderId(parsedFolderId);

    return NextResponse.json(settings);
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
      "Failed to retrieve trip settings:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible obtener la configuración del viaje.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Configures a travel folder with its base currency.
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
      !("baseCurrencyCode" in body) ||
      typeof body.baseCurrencyCode !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Debés indicar una moneda base válida.",
        },
        {
          status: 400,
        },
      );
    }

    const settings = await configureTrip({
      folderId: parsedFolderId,
      baseCurrencyCode: body.baseCurrencyCode,
    });

    return NextResponse.json(settings, {
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
      "Failed to configure trip:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "No fue posible configurar el viaje.",
      },
      {
        status: 500,
      },
    );
  }
}