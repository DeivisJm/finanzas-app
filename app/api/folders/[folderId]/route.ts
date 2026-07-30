import { createSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { updateFolderSchema } from "@/validators/folder-validator";
import { NextResponse } from "next/server";

interface FolderRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

/**
 * Converts a route parameter into a valid identifier.
 */
function parseIdentifier(value: string): number | null {
  const identifier = Number(value);

  return Number.isInteger(identifier) && identifier > 0
    ? identifier
    : null;
}

/**
 * Returns a folder, its project and its pending summary.
 */
export async function GET(
  _request: Request,
  context: FolderRouteContext,
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = parseIdentifier(folderId);

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

    const folder = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },

      include: {
        project: true,

        expenses: {
          where: {
            isPaid: false,
          },

          select: {
            amount: true,
          },
        },
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

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      color: folder.color,
      icon: folder.icon,
      projectId: folder.projectId,
      project: folder.project,
      expenseCount: folder.expenses.length,
      totalAmount: folder.expenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      createdAt: folder.createdAt,
    });
  } catch (error: unknown) {
    console.error("Failed to retrieve folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener la carpeta.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Updates the configurable information of a folder.
 */
export async function PATCH(
  request: Request,
  context: FolderRouteContext,
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = parseIdentifier(folderId);

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

    const body: unknown = await request.json();
    const validationResult =
      updateFolderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "La información de la carpeta no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const existingFolder =
      await prisma.folder.findUnique({
        where: {
          id: parsedFolderId,
        },

        select: {
          id: true,
          projectId: true,
        },
      });

    if (!existingFolder) {
      return NextResponse.json(
        {
          message:
            "La carpeta que intentás editar no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const { name, color, icon } =
      validationResult.data;

    const slug = createSlug(name);

    const duplicateFolder =
      await prisma.folder.findFirst({
        where: {
          projectId: existingFolder.projectId,
          slug,

          NOT: {
            id: parsedFolderId,
          },
        },

        select: {
          id: true,
        },
      });

    if (duplicateFolder) {
      return NextResponse.json(
        {
          message:
            "Ya existe otra carpeta con ese nombre.",
        },
        {
          status: 409,
        },
      );
    }

    const folder = await prisma.folder.update({
      where: {
        id: parsedFolderId,
      },

      data: {
        name,
        slug,
        color,
        icon,
      },
    });

    return NextResponse.json({
      ...folder,
      expenseCount: 0,
      totalAmount: 0,
    });
  } catch (error: unknown) {
    console.error("Failed to update folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible actualizar la carpeta.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Deletes a folder and its associated expenses.
 */
export async function DELETE(
  _request: Request,
  context: FolderRouteContext,
) {
  try {
    const { folderId } = await context.params;
    const parsedFolderId = parseIdentifier(folderId);

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
          message:
            "La carpeta que intentás eliminar no existe.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.folder.delete({
      where: {
        id: parsedFolderId,
      },
    });

    return NextResponse.json({
      message: "Carpeta eliminada correctamente.",
    });
  } catch (error: unknown) {
    console.error("Failed to delete folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible eliminar la carpeta.",
      },
      {
        status: 500,
      },
    );
  }
}