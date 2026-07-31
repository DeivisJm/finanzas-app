import { FolderManager } from "@/components/folders/folder-manager";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { prisma } from "@/lib/prisma";
import type { FolderSummary } from "@/types/folder";
import { getIconComponent } from "@/lib/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{
    projectSlug: string;
  }>;
}

/**
 * Loads the project and calculates pending totals for its folders.
 */
async function getProject(projectSlug: string) {
  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug,
    },

    include: {
      folders: {
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
      },
    },
  });

  if (!project) {
    return null;
  }

  const folders: FolderSummary[] =
    project.folders.map((folder) => ({
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
      createdAt: folder.createdAt.toISOString(),
    }));

  return {
    project,
    folders,
  };
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { projectSlug } = await params;
  const data = await getProject(projectSlug);

  if (!data) {
    notFound();
  }

  const { project, folders } = data;

  const ProjectIcon = getIconComponent(project.icon);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        className="pointer-events-none absolute left-1/2 top-[-22rem] size-[42rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: project.color,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-[calc(env(safe-area-inset-top)+2rem)] sm:px-6 sm:py-8 lg:px-8">
        <nav className="mb-12 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <ThemeToggle />
        </nav>

        <header className="mb-12 max-w-3xl">
          <div
            className="mb-5 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              backgroundColor: project.color,
            }}
          >
            <ProjectIcon size={27} strokeWidth={1.8} />
          </div>

          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Proyecto
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {project.name}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {project.description ??
              "Administrá tus carpetas y mantené tus gastos organizados."}
          </p>
        </header>

        <FolderManager
          projectId={project.id}
          projectSlug={project.slug}
          initialFolders={folders}
        />
      </div>
    </main>
  );
}