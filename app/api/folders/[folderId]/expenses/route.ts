import { parseExpense } from "@/lib/expense-parser";
import { prisma } from "@/lib/prisma";
import { createExpenseSchema } from "@/validators/expense-validator";
import { NextResponse } from "next/server";

interface ExpenseRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

/**
 * Converts a route parameter into a valid positive identifier.
 */
function parseIdentifier(value: string): number | null {
  const identifier = Number(value);

  return Number.isInteger(identifier) && identifier > 0
    ? identifier
    : null;
}

/**
 * Returns pending expenses registered inside a folder.
 */
export async function GET(
  _request: Request,
  context: ExpenseRouteContext,
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

    const expenses = await prisma.expense.findMany({
      where: {
        folderId: parsedFolderId,
        isPaid: false,
      },
      orderBy: [
        {
          expenseDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error("Failed to retrieve expenses:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener los gastos.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Creates an expense inside a folder from natural-language input.
 */
export async function POST(
  request: Request,
  context: ExpenseRouteContext,
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

    const body: unknown = await request.json();
    const validationResult = createExpenseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "La información del gasto no es válida.",
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
          message: "La carpeta seleccionada no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const parsedExpense = parseExpense(
      validationResult.data.text,
    );

    const expenseDate = new Date();

    const expense = await prisma.expense.create({
  data: {
    description: parsedExpense.description,
    amount: parsedExpense.amount,
    expenseDate,
    folderId: parsedFolderId,
  },
});

    return NextResponse.json(expense, {
      status: 201,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible registrar el gasto.";

    console.error("Failed to create expense:", error);

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
}