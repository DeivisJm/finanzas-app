import { createSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { createFolderSchema } from "@/validators/folder-validator";
import { NextResponse } from "next/server";

/**
 * Returns the folders associated with a project.
 *
 * Only pending expenses are included in the displayed totals.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = Number(
      url.searchParams.get("projectId"),
    );

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        {
          message:
            "El identificador del proyecto no es válido.",
        },
        {
          status: 400,
        },
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
          where: {
            isPaid: false,
          },

          select: {
            amount: true,
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
      expenseCount: folder.expenses.length,
      totalAmount: folder.expenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      createdAt: folder.createdAt,
    }));

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Failed to retrieve folders:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener las carpetas.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Creates a folder inside an existing project.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validationResult =
      createFolderSchema.safeParse(body);

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

    const { name, color, icon, projectId } =
      validationResult.data;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          message: "El proyecto seleccionado no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          message:
            "No fue posible generar un identificador para la carpeta.",
        },
        {
          status: 400,
        },
      );
    }

    const existingFolder =
      await prisma.folder.findUnique({
        where: {
          projectId_slug: {
            projectId,
            slug,
          },
        },

        select: {
          id: true,
        },
      });

    if (existingFolder) {
      return NextResponse.json(
        {
          message:
            "Ya existe una carpeta con ese nombre.",
        },
        {
          status: 409,
        },
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
      },
    );
  } catch (error: unknown) {
    console.error("Failed to create folder:", error);

    return NextResponse.json(
      {
        message: "No fue posible crear la carpeta.",
      },
      {
        status: 500,
      },
    );
  }
}