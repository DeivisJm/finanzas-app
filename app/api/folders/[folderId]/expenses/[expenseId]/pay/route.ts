import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PayExpenseRouteContext {
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
 * Marks a pending expense as paid.
 */
export async function PATCH(
  _request: Request,
  context: PayExpenseRouteContext,
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
          message: "Este gasto ya se encuentra pagado.",
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
        isPaid: true,
        paidAt: new Date(),
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error: unknown) {
    console.error("Failed to pay expense:", error);

    return NextResponse.json(
      {
        message: "No fue posible marcar el gasto como pagado.",
      },
      {
        status: 500,
      },
    );
  }
}