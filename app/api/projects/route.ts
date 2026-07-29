import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Returns all available projects with their folder count.
 */
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        _count: {
          select: {
            folders: true,
          },
        },
      },
    });

    const response = projects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      color: project.color,
      icon: project.icon,
      sortOrder: project.sortOrder,
      folderCount: project._count.folders,
    }));

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