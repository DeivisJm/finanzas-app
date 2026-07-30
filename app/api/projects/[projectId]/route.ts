import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import { updateProjectSchema } from "@/validators/project-validator";
import { NextResponse } from "next/server";

interface ProjectRouteContext {
  params: Promise<{
    projectId: string;
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
 * Updates an existing project.
 */
export async function PATCH(
  request: Request,
  context: ProjectRouteContext,
) {
  try {
    const { projectId } = await context.params;
    const parsedProjectId =
      parseIdentifier(projectId);

    if (!parsedProjectId) {
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

    const body: unknown = await request.json();
    const validationResult =
      updateProjectSchema.safeParse(body);

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

    const existingProject =
      await prisma.project.findUnique({
        where: {
          id: parsedProjectId,
        },

        select: {
          id: true,
        },
      });

    if (!existingProject) {
      return NextResponse.json(
        {
          message:
            "El proyecto que intentás editar no existe.",
        },
        {
          status: 404,
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

    const duplicateProject =
      await prisma.project.findFirst({
        where: {
          slug,

          NOT: {
            id: parsedProjectId,
          },
        },

        select: {
          id: true,
        },
      });

    if (duplicateProject) {
      return NextResponse.json(
        {
          message:
            "Ya existe otro proyecto con ese nombre.",
        },
        {
          status: 409,
        },
      );
    }

    const project = await prisma.project.update({
      where: {
        id: parsedProjectId,
      },

      data: {
        name,
        slug,
        description: description || null,
        color,
        icon,
      },
    });

    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("Failed to update project:", error);

    return NextResponse.json(
      {
        message: "No fue posible actualizar el proyecto.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Deletes a project, its folders and their expenses.
 */
export async function DELETE(
  _request: Request,
  context: ProjectRouteContext,
) {
  try {
    const { projectId } = await context.params;
    const parsedProjectId =
      parseIdentifier(projectId);

    if (!parsedProjectId) {
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

    const project = await prisma.project.findUnique({
      where: {
        id: parsedProjectId,
      },

      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          message:
            "El proyecto que intentás eliminar no existe.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.project.delete({
      where: {
        id: parsedProjectId,
      },
    });

    return NextResponse.json({
      message: "Proyecto eliminado correctamente.",
    });
  } catch (error: unknown) {
    console.error("Failed to delete project:", error);

    return NextResponse.json(
      {
        message: "No fue posible eliminar el proyecto.",
      },
      {
        status: 500,
      },
    );
  }
}