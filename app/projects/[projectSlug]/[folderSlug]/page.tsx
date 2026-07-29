import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

type FolderPageProps = {
  params: Promise<{
    projectSlug: string;
    folderSlug: string;
  }>;
};

export default async function FolderPage({
  params,
}: FolderPageProps) {
  const { projectSlug, folderSlug } = await params;

  const formattedFolderName = folderSlug
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/projects/${projectSlug}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al proyecto
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <ReceiptText size={24} />
          </div>

          <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Carpeta
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {formattedFolderName}
          </h1>

          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Consultá y registrá los gastos correspondientes a esta carpeta.
          </p>
        </header>
      </div>
    </main>
  );
}