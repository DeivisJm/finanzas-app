import { formatCurrency, formatNumber } from "@/lib/formatters";
import { getIconComponent } from "@/lib/icons";
import type { ProjectSummary } from "@/types/project";
import { ArrowUpRight, FolderOpen, ReceiptText } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  project: ProjectSummary;
}

/**
 * Displays a project and its current financial summary.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const ProjectIcon = getIconComponent(project.icon);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          backgroundColor: project.color,
        }}
      />

      <div className="flex items-start justify-between gap-5">
        <div
          className="flex size-14 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{
            backgroundColor: project.color,
          }}
        >
          <ProjectIcon size={27} strokeWidth={1.8} />
        </div>

        <div className="flex size-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white dark:border-zinc-700 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-zinc-950">
          <ArrowUpRight size={19} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          {project.name}
        </h2>

        <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {project.description ?? "Administrá la información de este proyecto."}
        </p>
      </div>

      <div className="mt-7 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/70">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
          Total registrado
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {formatCurrency(project.totalAmount)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <FolderOpen size={16} />
          {formatNumber(project.folderCount)}{" "}
          {project.folderCount === 1 ? "carpeta" : "carpetas"}
        </span>

        <span className="inline-flex items-center gap-2">
          <ReceiptText size={16} />
          {formatNumber(project.expenseCount)}{" "}
          {project.expenseCount === 1 ? "gasto" : "gastos"}
        </span>
      </div>
    </Link>
  );
}