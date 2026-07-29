import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Displays a compact financial metric on the dashboard.
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}