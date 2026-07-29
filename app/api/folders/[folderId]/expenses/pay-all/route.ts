import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PayAllExpensesRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

function parseIdentifier(value: string): number | null {
  const identifier = Number(value);

  return Number.isInteger(identifier) && identifier > 0
    ? identifier
    : null;
}

/**
 * Marks every pending expense in a folder as paid.
 */
export async function PATCH(
  _request: Request,
  context: PayAllExpensesRouteContext,
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = parseIdentifier(folderId);

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

    const folder = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },
      select: {
        id: true,
      },
    });

    if (!folder) {
      return NextResponse.json(
        {
          message: "La carpeta solicitada no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const result = await prisma.expense.updateMany({
      where: {
        folderId: parsedFolderId,
        isPaid: false,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    return NextResponse.json({
      message:
        result.count > 0
          ? "Todos los gastos fueron marcados como pagados."
          : "No hay gastos pendientes.",
      updatedCount: result.count,
    });
  } catch (error: unknown) {
    console.error("Failed to pay all expenses:", error);

    return NextResponse.json(
      {
        message: "No fue posible pagar todos los gastos.",
      },
      {
        status: 500,
      },
    );
  }
}