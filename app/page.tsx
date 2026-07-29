import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProjectCard } from "@/components/projects/project-card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import type { ProjectSummary } from "@/types/project";
import {

  FolderOpen,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

/**
 * Loads the projects and calculates their financial summaries.
 */
async function getDashboardProjects(): Promise<ProjectSummary[]> {
  const projects = await prisma.project.findMany({
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      folders: {
        select: {
          expenses: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
  });

  return projects.map((project) => {
    const expenses = project.folders.flatMap(
      (folder) => folder.expenses,
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
      expenseCount: expenses.length,
      totalAmount: expenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
    };
  });
}

export default async function HomePage() {
  const projects = await getDashboardProjects();


  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] size-[36rem] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-950/25" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-zinc-950">
              <LayoutDashboard size={22} />
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                Finanzas
              </p>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Panel personal
              </p>
            </div>
          </div>

          <ThemeToggle />
        </nav>

        <header className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
            <Sparkles size={14} />
            Tu información financiera en un solo lugar
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Controlá tus gastos sin complicaciones.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Organizá tus tarjetas, viajes y proyectos personales
            mediante carpetas independientes.
          </p>
        </header>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Espacios de trabajo
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Tus proyectos
              </h2>
            </div>

            <p className="hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
              {projects.length}{" "}
              {projects.length === 1 ? "proyecto" : "proyectos"}
            </p>
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
              <FolderOpen
                className="mx-auto text-zinc-400"
                size={38}
              />

              <h2 className="mt-5 text-lg font-semibold">
                Todavía no hay proyectos
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Ejecutá el seed de Prisma para crear Tarjetas de
                crédito, Viajes y la carpeta inicial Davivienda.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}