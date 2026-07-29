import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";

type ProjectPageProps = {
  params: Promise<{
    projectSlug: string;
  }>;
};

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { projectSlug } = await params;

  const projectNames: Record<string, string> = {
    "credit-cards": "Tarjetas de crédito",
    trips: "Viajes",
  };

  const projectName =
    projectNames[projectSlug] ?? "Proyecto";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <FolderOpen size={24} />
          </div>

          <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Proyecto
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {projectName}
          </h1>

          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Administrá las carpetas asociadas con este proyecto.
          </p>
        </header>

        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <FolderOpen
            className="mx-auto mb-4 text-zinc-400"
            size={36}
          />

          <h2 className="text-lg font-semibold">
            Carpetas del proyecto
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Aquí aparecerán las carpetas obtenidas desde la base de datos.
          </p>
        </section>
      </div>
    </main>
  );
}