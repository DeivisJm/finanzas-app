import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProjectManager } from "@/components/projects/project-manager";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { ProjectSummary } from "@/types/project";
import {
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

/**
 * Loads projects and calculates pending and historical summaries.
 */
async function getDashboardProjects(): Promise<
  ProjectSummary[]
> {
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

  return projects.map((project) => {
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
}

export default async function HomePage() {
  const projects = await getDashboardProjects();

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] size-[36rem] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-950/25" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="/icon.png"
                alt="Logo de Wallet Pro"
                fill
                priority
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Wallet Pro
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Panel financiero
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
            Organizá tus tarjetas, viajes y proyectos
            personales mediante carpetas independientes.
          </p>
        </header>

        <ProjectManager
          initialProjects={projects}
        />
      </div>
    </main>
  );
}