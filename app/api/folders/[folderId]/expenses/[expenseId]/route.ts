import { prisma } from "@/lib/prisma";
import { updateExpenseSchema } from "@/validators/expense-validator";
import { NextResponse } from "next/server";

interface ExpenseItemRouteContext {
  params: Promise<{
    folderId: string;
    expenseId: string;
  }>;
}

function parseIdentifier(value: string): number | null {
  const identifier = Number(value);

  return Number.isInteger(identifier) && identifier > 0
    ? identifier
    : null;
}

/**
 * Updates an existing pending expense.
 */
export async function PATCH(
  request: Request,
  context: ExpenseItemRouteContext,
) {
  try {
    const { folderId, expenseId } = await context.params;

    const parsedFolderId = parseIdentifier(folderId);
    const parsedExpenseId = parseIdentifier(expenseId);

    if (!parsedFolderId || !parsedExpenseId) {
      return NextResponse.json(
        {
          message: "Los identificadores recibidos no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const body: unknown = await request.json();
    const validationResult = updateExpenseSchema.safeParse(body);

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

    const expense = await prisma.expense.findFirst({
      where: {
        id: parsedExpenseId,
        folderId: parsedFolderId,
      },
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: "El gasto solicitado no existe.",
        },
        {
          status: 404,
        },
      );
    }

    if (expense.isPaid) {
      return NextResponse.json(
        {
          message: "Un gasto pagado no puede editarse.",
        },
        {
          status: 409,
        },
      );
    }

    const updatedExpense = await prisma.expense.update({
      where: {
        id: parsedExpenseId,
      },
      data: {
        description: validationResult.data.description,
        amount: validationResult.data.amount,
        expenseDate: validationResult.data.expenseDate
          ? new Date(
              `${validationResult.data.expenseDate}T12:00:00`,
            )
          : undefined,
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error: unknown) {
    console.error("Failed to update expense:", error);

    return NextResponse.json(
      {
        message: "No fue posible actualizar el gasto.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Deletes an expense permanently.
 */
export async function DELETE(
  _request: Request,
  context: ExpenseItemRouteContext,
) {
  try {
    const { folderId, expenseId } = await context.params;

    const parsedFolderId = parseIdentifier(folderId);
    const parsedExpenseId = parseIdentifier(expenseId);

    if (!parsedFolderId || !parsedExpenseId) {
      return NextResponse.json(
        {
          message: "Los identificadores recibidos no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: parsedExpenseId,
        folderId: parsedFolderId,
      },
      select: {
        id: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: "El gasto solicitado no existe.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.expense.delete({
      where: {
        id: parsedExpenseId,
      },
    });

    return NextResponse.json({
      message: "Gasto eliminado correctamente.",
    });
  } catch (error: unknown) {
    console.error("Failed to delete expense:", error);

    return NextResponse.json(
      {
        message: "No fue posible eliminar el gasto.",
      },
      {
        status: 500,
      },
    );
  }
}