"use client";

import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatters";
import { getIconComponent } from "@/lib/icons";
import type { ProjectSummary } from "@/types/project";
import {
  ArrowUpRight,
  Ellipsis,
  FolderOpen,
  Pencil,
  ReceiptText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

interface ProjectCardProps {
  project: ProjectSummary;
  onEdit: (project: ProjectSummary) => void;
  onDelete: (project: ProjectSummary) => void;
}

/**
 * Displays a project with pending totals, historical activity
 * and project management actions.
 */
export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const ProjectIcon = getIconComponent(project.icon);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent): void {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu,
      );
    };
  }, []);

  return (
    <article className="group relative isolate overflow-visible rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden rounded-t-[2rem]">
        <div
          className="absolute -left-16 -top-24 h-44 w-[70%] rotate-[-5deg] rounded-[50%] opacity-20 blur-2xl transition duration-500 group-hover:scale-110 group-hover:opacity-30"
          style={{
            backgroundColor: project.color,
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-1.5 rounded-t-[2rem]"
          style={{
            background: `linear-gradient(90deg, ${project.color}, ${project.color}99, transparent)`,
          }}
        />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-5">
          <Link
            href={`/projects/${project.slug}`}
            className="relative flex size-14 items-center justify-center overflow-hidden rounded-2xl text-white shadow-lg transition duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${project.color}, ${project.color}cc)`,
              boxShadow: `0 14px 30px ${project.color}30`,
            }}
            aria-label={`Abrir ${project.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />

            <ProjectIcon
              className="relative"
              size={27}
              strokeWidth={1.8}
            />
          </Link>

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen((current) => !current)
              }
              className="flex size-10 items-center justify-center rounded-full border border-zinc-200/80 bg-white/70 text-zinc-500 shadow-sm backdrop-blur transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label={`Acciones de ${project.name}`}
            >
              <Ellipsis size={20} />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(project);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Pencil size={16} />
                  Editar proyecto
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(project);
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={16} />
                  Eliminar proyecto
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="mt-8 block"
        >
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {project.name}
          </h2>

          <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {project.description ??
              "Administrá las carpetas y movimientos de este proyecto."}
          </p>

          <div className="mt-7 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 transition group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/70 dark:group-hover:border-zinc-700">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              Total pendiente
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatCurrency(project.totalAmount)}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <FolderOpen size={16} />

                {formatNumber(project.folderCount)}{" "}
                {project.folderCount === 1
                  ? "carpeta"
                  : "carpetas"}
              </span>

              <span className="inline-flex items-center gap-2">
                <ReceiptText size={16} />

                {formatNumber(project.expenseCount)}{" "}
                {project.expenseCount === 1
                  ? "gasto histórico"
                  : "gastos históricos"}
              </span>
            </div>

            <span className="flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:border-zinc-700 dark:group-hover:border-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-300">
              <ArrowUpRight size={17} />
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}