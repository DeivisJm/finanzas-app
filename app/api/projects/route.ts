import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import { createProjectSchema } from "@/validators/project-validator";
import { NextResponse } from "next/server";

/**
 * Returns all projects with their pending and historical summaries.
 */
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        sortOrder: "asc",
      },

      include: {
        folders: {
          select: {
            expenses: {
              where: {
                isPaid: false,
              },

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
        },
      },
    });

    const response = projects.map((project) => {
      const pendingExpenses = project.folders.flatMap(
        (folder) => folder.expenses,
      );

      const historicalExpenseCount =
        project.folders.reduce(
          (total, folder) =>
            total + folder._count.expenses,
          0,
        );

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        color: project.color,
        icon: project.icon,
        sortOrder: project.sortOrder,
        folderCount: project.folders.length,
        expenseCount: historicalExpenseCount,
        totalAmount: pendingExpenses.reduce(
          (total, expense) => total + expense.amount,
          0,
        ),
      };
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Failed to retrieve projects:", error);

    return NextResponse.json(
      {
        message: "No fue posible obtener los proyectos.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Creates a new project.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validationResult =
      createProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "La información del proyecto no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const { name, description, color, icon } =
      validationResult.data;

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          message:
            "No fue posible generar el identificador del proyecto.",
        },
        {
          status: 400,
        },
      );
    }

    const existingProject =
      await prisma.project.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

    if (existingProject) {
      return NextResponse.json(
        {
          message:
            "Ya existe un proyecto con ese nombre.",
        },
        {
          status: 409,
        },
      );
    }

    const lastProject = await prisma.project.findFirst({
      orderBy: {
        sortOrder: "desc",
      },

      select: {
        sortOrder: true,
      },
    });

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description: description || null,
        color,
        icon,
        sortOrder: (lastProject?.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json(
      {
        ...project,
        folderCount: 0,
        expenseCount: 0,
        totalAmount: 0,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Failed to create project:", error);

    return NextResponse.json(
      {
        message: "No fue posible crear el proyecto.",
      },
      {
        status: 500,
      },
    );
  }
}