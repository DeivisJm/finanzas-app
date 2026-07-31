"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ProjectSummary } from "@/types/project";
import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";
import { ProjectCard } from "./project-card";
import { ProjectDialog } from "./project-dialog";

interface ProjectManagerProps {
  initialProjects: ProjectSummary[];
}

/**
 * Handles project creation, editing and deletion.
 */
export function ProjectManager({
  initialProjects,
}: ProjectManagerProps) {
  const [projects, setProjects] =
    useState<ProjectSummary[]>(initialProjects);

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState<ProjectSummary | null>(null);

  const [projectToDelete, setProjectToDelete] =
    useState<ProjectSummary | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState("");

  function openCreateDialog(): void {
    setSelectedProject(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(
    project: ProjectSummary,
  ): void {
    setSelectedProject(project);
    setIsDialogOpen(true);
  }

  function handleSaved(
    project: ProjectSummary,
  ): void {
    setProjects((currentProjects) => {
      const exists = currentProjects.some(
        (currentProject) =>
          currentProject.id === project.id,
      );

      if (exists) {
        return currentProjects.map(
          (currentProject) =>
            currentProject.id === project.id
              ? project
              : currentProject,
        );
      }

      return [...currentProjects, project].sort(
        (firstProject, secondProject) =>
          firstProject.sortOrder -
          secondProject.sortOrder,
      );
    });
  }

  async function confirmDelete(): Promise<void> {
    if (!projectToDelete) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/projects/${projectToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
          "No fue posible eliminar el proyecto.",
        );
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project.id !== projectToDelete.id,
        ),
      );

      setProjectToDelete(null);
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible eliminar el proyecto.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section>
        <div className="mt-12 mb-8 flex flex-col gap-5 sm:mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Espacios de trabajo
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Tus proyectos
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="hidden text-sm text-zinc-500 md:block dark:text-zinc-400">
              {projects.length}{" "}
              {projects.length === 1
                ? "proyecto"
                : "proyectos"}
            </p>

            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-zinc-900 bg-zinc-900 px-6 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-black/10">
                <Plus
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </span>

              Nuevo proyecto
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        {projects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEditDialog}
                onDelete={setProjectToDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              <LayoutGrid size={26} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Todavía no hay proyectos
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Creá un proyecto para comenzar a organizar
              tus carpetas y movimientos.
            </p>

            <button
              type="button"
              onClick={openCreateDialog}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              <Plus size={17} />
              Crear primer proyecto
            </button>
          </div>
        )}
      </section >

      <ProjectDialog
        isOpen={isDialogOpen}
        project={selectedProject}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Eliminar proyecto"
        description={`¿Seguro que querés eliminar “${projectToDelete?.name ?? ""
          }”? También se eliminarán permanentemente todas sus carpetas y los gastos asociados. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar proyecto"
        variant="danger"
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setProjectToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}