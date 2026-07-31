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
 * Displays a folder with its pending expense summary and management actions.
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

  const folderHref = `/projects/${projectSlug}/${folder.slug}`;

  const expenseLabel =
    folder.expenseCount === 1
      ? "1 gasto pendiente"
      : `${folder.expenseCount} gastos pendientes`;

  /**
   * Closes the actions menu when the user clicks outside of it.
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /**
   * Opens or closes the folder actions menu.
   */
  function toggleMenu(): void {
    setIsMenuOpen((currentState) => !currentState);
  }

  /**
   * Closes the menu and forwards the selected folder to the edit action.
   */
  function handleEdit(): void {
    setIsMenuOpen(false);
    onEdit(folder);
  }

  /**
   * Closes the menu and forwards the selected folder to the delete action.
   */
  function handleDelete(): void {
    setIsMenuOpen(false);
    onDelete(folder);
  }

  return (
    <article
      className="
        group
        relative
        flex
        min-h-[250px]
        flex-col
        overflow-hidden
        rounded-[1.75rem]
        border
        border-zinc-200/80
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-300
        hover:shadow-xl
        hover:shadow-zinc-950/5
        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
        dark:hover:shadow-black/30
      "
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{
          backgroundColor: folder.color,
        }}
      />

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={folderHref}
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-4
              rounded-2xl
              outline-none
              focus-visible:ring-2
              focus-visible:ring-zinc-400
              focus-visible:ring-offset-2
              dark:focus-visible:ring-zinc-600
              dark:focus-visible:ring-offset-zinc-900
            "
          >
            <div
              className="
                flex
                size-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                text-white
                shadow-sm
              "
              style={{
                backgroundColor: folder.color,
              }}
            >
              <FolderIcon
                size={22}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-base
                  font-semibold
                  tracking-tight
                  text-zinc-950
                  dark:text-white
                "
              >
                {folder.name}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  font-medium
                  text-zinc-500
                  dark:text-zinc-400
                "
              >
                {expenseLabel}
              </p>
            </div>
          </Link>

          <div
            ref={menuRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              onClick={toggleMenu}
              className="
                flex
                size-10
                items-center
                justify-center
                rounded-xl
                text-zinc-500
                outline-none
                transition-colors
                hover:bg-zinc-100
                hover:text-zinc-950
                focus-visible:ring-2
                focus-visible:ring-zinc-400
                dark:text-zinc-400
                dark:hover:bg-zinc-800
                dark:hover:text-white
                dark:focus-visible:ring-zinc-600
              "
              aria-label={`Acciones de ${folder.name}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <Ellipsis size={20} />
            </button>

            {isMenuOpen ? (
              <div
                role="menu"
                className="
                  absolute
                  right-0
                  top-12
                  z-30
                  w-48
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-1.5
                  shadow-xl
                  shadow-zinc-950/10
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:shadow-black/40
                "
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEdit}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-zinc-700
                    outline-none
                    transition-colors
                    hover:bg-zinc-100
                    hover:text-zinc-950
                    focus-visible:bg-zinc-100
                    dark:text-zinc-300
                    dark:hover:bg-zinc-800
                    dark:hover:text-white
                    dark:focus-visible:bg-zinc-800
                  "
                >
                  <Pencil size={16} />
                  Editar carpeta
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-medium
                    text-red-600
                    outline-none
                    transition-colors
                    hover:bg-red-50
                    focus-visible:bg-red-50
                    dark:text-red-400
                    dark:hover:bg-red-950/40
                    dark:focus-visible:bg-red-950/40
                  "
                >
                  <Trash2 size={16} />
                  Eliminar carpeta
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Link
          href={folderHref}
          className="
            mt-6
            flex
            flex-1
            flex-col
            rounded-2xl
            outline-none
            focus-visible:ring-2
            focus-visible:ring-zinc-400
            focus-visible:ring-offset-2
            dark:focus-visible:ring-zinc-600
            dark:focus-visible:ring-offset-zinc-900
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-zinc-200/80
              bg-zinc-50
              p-4
              transition-colors
              group-hover:bg-zinc-100/80
              dark:border-zinc-800
              dark:bg-zinc-950/70
              dark:group-hover:bg-zinc-950
            "
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.16em]
                text-zinc-500
                dark:text-zinc-400
              "
            >
              Total pendiente
            </p>

            <p
              className="
                mt-2
                text-3xl
                font-semibold
                tracking-tight
                text-zinc-950
                dark:text-white
              "
            >
              {formatCurrency(folder.totalAmount)}
            </p>
          </div>

          <div
            className="
              mt-auto
              flex
              items-center
              justify-between
              pt-5
              text-sm
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-2
                font-medium
                text-zinc-500
                transition-colors
                group-hover:text-zinc-950
                dark:text-zinc-400
                dark:group-hover:text-white
              "
            >
              <ReceiptText size={16} />
              Ver movimientos
            </span>

            <ArrowUpRight
              size={18}
              className="
                text-zinc-400
                transition-all
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
                group-hover:text-zinc-950
                dark:group-hover:text-white
              "
            />
          </div>
        </Link>
      </div>
    </article>
  );
}