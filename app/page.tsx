import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  Plane,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950">
            <LayoutDashboard size={24} />
          </div>

          <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Panel personal
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tus proyectos
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Administrá tus tarjetas de crédito, viajes y demás proyectos desde
            un solo lugar.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <Link
            href="/projects/credit-cards"
            className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <CreditCard size={28} />
              </div>

              <ArrowRight
                className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-950 dark:group-hover:text-white"
                size={22}
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold">Tarjetas de crédito</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Registrá y controlá los gastos realizados con tus tarjetas.
              </p>
            </div>
          </Link>

          <Link
            href="/projects/trips"
            className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Plane size={28} />
              </div>

              <ArrowRight
                className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-950 dark:group-hover:text-white"
                size={22}
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold">Viajes</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Organizá carpetas, presupuestos y gastos para cada viaje.
              </p>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}