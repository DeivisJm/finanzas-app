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
 * Returns every expense registered inside a specific folder.
 */
export async function GET(
  _request: Request,
  context: ExpenseRouteContext
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = Number(folderId);

    if (!Number.isInteger(parsedFolderId) || parsedFolderId <= 0) {
      return NextResponse.json(
        {
          message: "El identificador de la carpeta no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const folderExists = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },
      select: {
        id: true,
      },
    });

    if (!folderExists) {
      return NextResponse.json(
        {
          message: "La carpeta solicitada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        folderId: parsedFolderId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to retrieve expenses:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener los gastos.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Creates an expense inside a specific folder.
 *
 * @param request Request containing natural-language expense text.
 */
export async function POST(
  request: Request,
  context: ExpenseRouteContext
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = Number(folderId);

    if (!Number.isInteger(parsedFolderId) || parsedFolderId <= 0) {
      return NextResponse.json(
        {
          message: "El identificador de la carpeta no es válido.",
        },
        {
          status: 400,
        }
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
        }
      );
    }

    const folderExists = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },
      select: {
        id: true,
      },
    });

    if (!folderExists) {
      return NextResponse.json(
        {
          message: "La carpeta seleccionada no existe.",
        },
        {
          status: 404,
        }
      );
    }

    const parsedExpense = parseExpense(
      validationResult.data.text
    );

    const expense = await prisma.expense.create({
      data: {
        ...parsedExpense,
        folderId: parsedFolderId,
      },
    });

    return NextResponse.json(expense, {
      status: 201,
    });
  } catch (error) {
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
      }
    );
  }
}