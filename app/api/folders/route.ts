import { createSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { createFolderSchema } from "@/validators/folder-validator";
import { NextResponse } from "next/server";

/**
 * Returns folders belonging to a specific project.
 *
 * Query parameter:
 * projectId: Numeric project identifier.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = Number(url.searchParams.get("projectId"));

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        {
          message: "El identificador del proyecto no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const folders = await prisma.folder.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    const response = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      color: folder.color,
      icon: folder.icon,
      projectId: folder.projectId,
      expenseCount: folder._count.expenses,
      totalAmount: folder.expenses.reduce(
        (total, expense) => total + expense.amount,
        0
      ),
      createdAt: folder.createdAt,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to retrieve folders:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener las carpetas.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Creates a folder inside an existing project.
 *
 * @param request Request containing folder name, color, icon and project ID.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validationResult = createFolderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "La información de la carpeta no es válida.",
        },
        {
          status: 400,
        }
      );
    }

    const { name, color, icon, projectId } = validationResult.data;
    const slug = createSlug(name);

    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          message: "El proyecto seleccionado no existe.",
        },
        {
          status: 404,
        }
      );
    }

    const existingFolder = await prisma.folder.findUnique({
      where: {
        projectId_slug: {
          projectId,
          slug,
        },
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        {
          message: "Ya existe una carpeta con ese nombre.",
        },
        {
          status: 409,
        }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        slug,
        color,
        icon,
        projectId,
      },
    });

    return NextResponse.json(
      {
        ...folder,
        expenseCount: 0,
        totalAmount: 0,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to create folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible crear la carpeta.",
      },
      {
        status: 500,
      }
    );
  }
}