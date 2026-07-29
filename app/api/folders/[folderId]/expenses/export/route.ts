import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ExportExpensesRouteContext {
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
 * Formats a date using the Costa Rican locale.
 */
function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

/**
 * Exports paid expenses as a plain-text file.
 */
export async function GET(
  _request: Request,
  context: ExportExpensesRouteContext,
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
        name: true,
        slug: true,
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

    const paidExpenses = await prisma.expense.findMany({
      where: {
        folderId: parsedFolderId,
        isPaid: true,
      },
      orderBy: [
        {
          expenseDate: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    const header = "Fecha | Monto | Descripción";

    const rows = paidExpenses.map((expense) => {
      return [
        formatDate(expense.expenseDate),
        formatCurrency(expense.amount),
        expense.description,
      ].join(" | ");
    });

    const content = [
      `Gastos pagados - ${folder.name}`,
      "",
      header,
      ...rows,
    ].join("\r\n");

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="gastos-pagados-${folder.slug}.txt"`,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to export expenses:", error);

    return NextResponse.json(
      {
        message: "No fue posible exportar los gastos.",
      },
      {
        status: 500,
      },
    );
  }
}