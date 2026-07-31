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
import { useRouter } from "next/navigation";
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
 * Displays a project with its financial summary and management actions.
 */
export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const ProjectIcon = getIconComponent(project.icon);

  const projectHref = `/projects/${project.slug}`;

  /**
   * Closes the actions menu when the user clicks outside of it.
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ): void {
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
   * Opens the selected project.
   */
  function openProject(): void {
    router.push(projectHref);
  }

  /**
   * Supports keyboard navigation for the project card.
   */
  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
  ): void {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openProject();
    }
  }

  /**
   * Toggles the project actions menu without opening the project.
   */
  function handleMenuToggle(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();

    setIsMenuOpen((currentState) => !currentState);
  }

  /**
   * Opens the project edit flow without triggering card navigation.
   */
  function handleEdit(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();

    setIsMenuOpen(false);
    onEdit(project);
  }

  /**
   * Opens the project deletion flow without triggering card navigation.
   */
  function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();

    setIsMenuOpen(false);
    onDelete(project);
  }

  const folderLabel =
    project.folderCount === 1
      ? "carpeta"
      : "carpetas";

  const expenseLabel =
    project.expenseCount === 1
      ? "gasto histórico"
      : "gastos históricos";

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openProject}
      onKeyDown={handleCardKeyDown}
      aria-label={`Abrir proyecto ${project.name}`}
      className="
        group
        relative
        isolate
        cursor-pointer
        overflow-visible
        rounded-[2rem]
        border
        border-zinc-200/80
        bg-white
        shadow-sm
        outline-none
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-300
        hover:shadow-2xl
        focus-visible:ring-2
        focus-visible:ring-zinc-400
        focus-visible:ring-offset-2
        dark:border-zinc-800
        dark:bg-zinc-900
        dark:hover:border-zinc-700
        dark:focus-visible:ring-zinc-600
        dark:focus-visible:ring-offset-zinc-950
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-32
          overflow-hidden
          rounded-t-[2rem]
        "
      >
        <div
          className="
            absolute
            -left-16
            -top-24
            h-44
            w-[70%]
            rotate-[-5deg]
            rounded-[50%]
            opacity-20
            blur-2xl
            transition-all
            duration-500
            group-hover:scale-110
            group-hover:opacity-30
          "
          style={{
            backgroundColor: project.color,
          }}
        />

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-1.5
            rounded-t-[2rem]
          "
          style={{
            background: `linear-gradient(90deg, ${project.color}, ${project.color}99, transparent)`,
          }}
        />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-5">
          <div
            className="
              relative
              flex
              size-14
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              text-white
              shadow-lg
              transition-transform
              duration-300
              group-hover:scale-105
            "
            style={{
              background: `linear-gradient(135deg, ${project.color}, ${project.color}cc)`,
              boxShadow: `0 14px 30px ${project.color}30`,
            }}
          >
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-white/25
                to-transparent
              "
            />

            <ProjectIcon
              className="relative"
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <div
            ref={menuRef}
            className="relative"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={handleMenuToggle}
              className="
                flex
                size-10
                items-center
                justify-center
                rounded-full
                border
                border-zinc-200/80
                bg-white/70
                text-zinc-500
                shadow-sm
                outline-none
                backdrop-blur
                transition-colors
                hover:border-zinc-300
                hover:bg-zinc-100
                hover:text-zinc-950
                focus-visible:ring-2
                focus-visible:ring-zinc-400
                dark:border-zinc-700
                dark:bg-zinc-900/70
                dark:text-zinc-400
                dark:hover:bg-zinc-800
                dark:hover:text-white
                dark:focus-visible:ring-zinc-600
              "
              aria-label={`Acciones de ${project.name}`}
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
                  w-52
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-1.5
                  shadow-2xl
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

                  Editar proyecto
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  className="
                    mt-1
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

                  Eliminar proyecto
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <h2
            className="
              text-xl
              font-semibold
              tracking-tight
              text-zinc-950
              transition-colors
              group-hover:text-indigo-600
              dark:text-white
              dark:group-hover:text-indigo-400
            "
          >
            {project.name}
          </h2>

          <p
            className="
              mt-2
              min-h-12
              text-sm
              leading-6
              text-zinc-500
              dark:text-zinc-400
            "
          >
            {project.description ??
              "Administrá las carpetas y movimientos de este proyecto."}
          </p>

          <div
            className="
              mt-7
              rounded-2xl
              border
              border-zinc-200/70
              bg-zinc-50/80
              p-4
              transition-colors
              group-hover:border-zinc-300
              dark:border-zinc-800
              dark:bg-zinc-950/70
              dark:group-hover:border-zinc-700
            "
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.16em]
                text-zinc-400
              "
            >
              Total pendiente
            </p>

            <p
              className="
                mt-2
                text-2xl
                font-semibold
                tracking-tight
                text-zinc-950
                dark:text-white
              "
            >
              {formatCurrency(project.totalAmount)}
            </p>
          </div>

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                flex-wrap
                gap-4
                text-sm
                text-zinc-500
                dark:text-zinc-400
              "
            >
              <span className="inline-flex items-center gap-2">
                <FolderOpen size={16} />

                {formatNumber(project.folderCount)}{" "}
                {folderLabel}
              </span>

              <span className="inline-flex items-center gap-2">
                <ReceiptText size={16} />

                {formatNumber(project.expenseCount)}{" "}
                {expenseLabel}
              </span>
            </div>

            <span
              aria-hidden="true"
              className="
                flex
                size-9
                items-center
                justify-center
                rounded-full
                border
                border-zinc-200
                text-zinc-400
                transition-all
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
                group-hover:border-indigo-300
                group-hover:bg-indigo-50
                group-hover:text-indigo-600
                dark:border-zinc-700
                dark:group-hover:border-indigo-600
                dark:group-hover:bg-indigo-950/50
                dark:group-hover:text-indigo-300
              "
            >
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}