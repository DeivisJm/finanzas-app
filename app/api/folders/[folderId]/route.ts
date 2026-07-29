import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface FolderRouteContext {
  params: Promise<{
    folderId: string;
  }>;
}

/**
 * Returns a folder and its related project information.
 */
export async function GET(
  _request: Request,
  context: FolderRouteContext
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

    const folder = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },
      include: {
        project: true,
        _count: {
          select: {
            expenses: true,
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
        }
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
      expenseCount: folder._count.expenses,
      createdAt: folder.createdAt,
    });
  } catch (error) {
    console.error("Failed to retrieve folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener la carpeta.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Deletes a folder and its associated expenses.
 */
export async function DELETE(
  _request: Request,
  context: FolderRouteContext
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

    const existingFolder = await prisma.folder.findUnique({
      where: {
        id: parsedFolderId,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        {
          message: "La carpeta que intentás eliminar no existe.",
        },
        {
          status: 404,
        }
      );
    }

    if (existingFolder.slug === "davivienda") {
      return NextResponse.json(
        {
          message:
            "La carpeta predeterminada Davivienda no puede eliminarse.",
        },
        {
          status: 403,
        }
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
  } catch (error) {
    console.error("Failed to delete folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible eliminar la carpeta.",
      },
      {
        status: 500,
      }
    );
  }
}