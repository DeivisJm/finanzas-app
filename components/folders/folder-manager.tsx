"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { FolderSummary } from "@/types/folder";
import { FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { FolderCard } from "./folder-card";
import { FolderDialog } from "./folder-dialog";

interface FolderManagerProps {
  projectId: number;
  projectSlug: string;
  initialFolders: FolderSummary[];
}

/**
 * Manages project folders and their interactive operations.
 */
export function FolderManager({
  projectId,
  projectSlug,
  initialFolders,
}: FolderManagerProps) {
  const [folders, setFolders] =
    useState<FolderSummary[]>(initialFolders);

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const [selectedFolder, setSelectedFolder] =
    useState<FolderSummary | null>(null);

  const [folderToDelete, setFolderToDelete] =
    useState<FolderSummary | null>(null);

  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] =
    useState(false);

  function openCreateDialog(): void {
    setSelectedFolder(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(folder: FolderSummary): void {
    setSelectedFolder(folder);
    setIsDialogOpen(true);
  }

  function handleSaved(folder: FolderSummary): void {
    setFolders((currentFolders) => {
      const exists = currentFolders.some(
        (currentFolder) =>
          currentFolder.id === folder.id,
      );

      if (exists) {
        return currentFolders.map((currentFolder) =>
          currentFolder.id === folder.id
            ? folder
            : currentFolder,
        );
      }

      return [...currentFolders, folder];
    });
  }

  async function confirmDelete(): Promise<void> {
    if (!folderToDelete) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/folders/${folderToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
          "No fue posible eliminar la carpeta.",
        );
      }

      setFolders((currentFolders) =>
        currentFolders.filter(
          (folder) =>
            folder.id !== folderToDelete.id,
        ),
      );

      setFolderToDelete(null);
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible eliminar la carpeta.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Organización
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Tus carpetas
            </h2>
          </div>

          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Plus size={18} />
            Nueva carpeta
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        {folders.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                projectSlug={projectSlug}
                onEdit={openEditDialog}
                onDelete={setFolderToDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              <FolderOpen size={26} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Todavía no hay carpetas
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Creá una carpeta para comenzar a organizar
              tus movimientos.
            </p>

            <button
              type="button"
              onClick={openCreateDialog}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              <Plus size={17} />
              Crear primera carpeta
            </button>
          </div>
        )}
      </section>

      <FolderDialog
        isOpen={isDialogOpen}
        projectId={projectId}
        folder={selectedFolder}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={Boolean(folderToDelete)}
        title="Eliminar carpeta"
        description={`¿Seguro que querés eliminar “${folderToDelete?.name ?? ""
          }”? Todos los gastos registrados dentro de esta carpeta también se eliminarán permanentemente. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar carpeta"
        variant="danger"
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setFolderToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}