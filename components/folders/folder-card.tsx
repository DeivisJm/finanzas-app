"use client";

import { formatCurrency } from "@/lib/formatters";
import { getIconComponent } from "@/lib/icons";
import type { FolderSummary } from "@/types/folder";
import {
  ArrowUpRight,
  Ellipsis,
  Pencil,
  ReceiptText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface FolderCardProps {
  folder: FolderSummary;
  projectSlug: string;
  onEdit: (folder: FolderSummary) => void;
  onDelete: (folder: FolderSummary) => void;
}

/**
 * Displays a folder and its pending financial summary.
 */
export function FolderCard({
  folder,
  projectSlug,
  onEdit,
  onDelete,
}: FolderCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const FolderIcon = getIconComponent(folder.icon);

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
    <article className="group relative rounded-[2rem] border border-zinc-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem]"
        style={{
          backgroundColor: folder.color,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/projects/${projectSlug}/${folder.slug}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{
              backgroundColor: folder.color,
            }}
          >
            <FolderIcon size={23} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-semibold tracking-tight">
              {folder.name}
            </h2>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {folder.expenseCount}{" "}
              {folder.expenseCount === 1
                ? "gasto pendiente"
                : "gastos pendientes"}
            </p>
          </div>
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
            className="flex size-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={`Acciones de ${folder.name}`}
          >
            <Ellipsis size={20} />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-11 z-20 w-48 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(folder);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Pencil size={16} />
                Editar carpeta
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(folder);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <Trash2 size={16} />
                Eliminar carpeta
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Link
        href={`/projects/${projectSlug}/${folder.slug}`}
        className="mt-7 block"
      >
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/70">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
            Total pendiente
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {formatCurrency(folder.totalAmount)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <ReceiptText size={16} />
            Ver movimientos
          </span>

          <ArrowUpRight
            size={18}
            className="text-zinc-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-950 dark:group-hover:text-white"
          />
        </div>
      </Link>
    </article>
  );
}