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
 * Validates a date using the YYYY-MM-DD format.
 */
function isValidDateParameter(value: string | null): value is string {
  return Boolean(
    value &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T12:00:00-06:00`)),
  );
}

/**
 * Returns the next calendar date in YYYY-MM-DD format.
 */
function getNextDate(value: string): string {
  const date = new Date(`${value}T12:00:00-06:00`);

  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}

/**
 * Formats a date using the Costa Rican locale.
 */
function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(value);
}

/**
 * Formats the date and time at which the report was generated.
 */
function formatGeneratedAt(value: Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(value);
}

/**
 * Exports only expenses paid during the requested local date.
 */
export async function GET(
  request: Request,
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

    const url = new URL(request.url);
    const requestedDate = url.searchParams.get("date");

    if (!isValidDateParameter(requestedDate)) {
      return NextResponse.json(
        {
          message: "La fecha de exportación no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const nextDate = getNextDate(requestedDate);

    const startOfDay = new Date(
      `${requestedDate}T00:00:00-06:00`,
    );

    const startOfNextDay = new Date(
      `${nextDate}T00:00:00-06:00`,
    );

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
        paidAt: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
      },
      orderBy: [
        {
          paidAt: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    if (paidExpenses.length === 0) {
      return NextResponse.json(
        {
          message:
            "No existen gastos pagados durante el día seleccionado.",
        },
        {
          status: 404,
        },
      );
    }

    const totalPaid = paidExpenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    );

    const rows = paidExpenses.map((expense, index) => {
      return [
        String(index + 1).padStart(2, "0"),
        formatDate(expense.expenseDate),
        formatCurrency(expense.amount),
        expense.description,
      ].join("\t");
    });

    const content = [
      "REPORTE DE GASTOS PAGADOS",
      "==============================================",
      `Carpeta: ${folder.name}`,
      `Fecha de pago: ${formatDate(startOfDay)}`,
      `Generado: ${formatGeneratedAt(new Date())}`,
      "",
      "N.º\tFECHA\tMONTO\tDESCRIPCIÓN",
      "----------------------------------------------",
      ...rows,
      "----------------------------------------------",
      `Cantidad de pagos:\t${paidExpenses.length}`,
      `TOTAL PAGADO:\t${formatCurrency(totalPaid)}`,
      "",
      "Fin del reporte",
    ].join("\r\n");

    return new NextResponse(`\uFEFF${content}`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="pagos-${folder.slug}-${requestedDate}.txt"`,
        "Cache-Control": "no-store",
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