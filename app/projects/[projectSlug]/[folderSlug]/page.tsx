import { ExpenseManager } from "@/components/expenses/expense-manager";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getIconComponent } from "@/lib/icons";
import { prisma } from "@/lib/prisma";
import type { Expense } from "@/types/expense";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface FolderPageProps {
  params: Promise<{
    projectSlug: string;
    folderSlug: string;
  }>;
}

/**
 * Loads a folder and its pending expenses.
 */
async function getFolder(
  projectSlug: string,
  folderSlug: string,
) {
  return prisma.folder.findFirst({
    where: {
      slug: folderSlug,
      project: {
        slug: projectSlug,
      },
    },
    include: {
      project: true,
      expenses: {
        where: {
          isPaid: false,
        },
        orderBy: [
          {
            expenseDate: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      },
    },
  });
}

export default async function FolderPage({
  params,
}: FolderPageProps) {
  const { projectSlug, folderSlug } = await params;
  const folder = await getFolder(
    projectSlug,
    folderSlug,
  );

  if (!folder) {
    notFound();
  }

  const FolderIcon = getIconComponent(folder.icon);

  const expenses: Expense[] = folder.expenses.map(
    (expense) => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate.toISOString(),
      isPaid: expense.isPaid,
      paidAt: expense.paidAt?.toISOString() ?? null,
      folderId: expense.folderId,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    }),
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        className="pointer-events-none absolute left-1/2 top-[-24rem] size-[44rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: folder.color,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav className="mb-10 flex items-center justify-between">
          <Link
            href={`/projects/${projectSlug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            Volver al proyecto
          </Link>

          <ThemeToggle />
        </nav>

        <header className="mb-10 max-w-3xl">
          <div
            className="mb-5 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              backgroundColor: folder.color,
            }}
          >
            <FolderIcon size={27} strokeWidth={1.8} />
          </div>

          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {folder.project.name}
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {folder.name}
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Registrá, revisá y administrá los gastos pendientes de esta carpeta.
          </p>
        </header>

        <ExpenseManager
        folderId={folder.id}
        initialExpenses={expenses}
         />
      </div>
    </main>
  );
}