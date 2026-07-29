"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Allows the user to switch between light and dark appearance.
 *
 * The selected theme is persisted in localStorage.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");

    setTheme(isDark ? "dark" : "light");
    setIsMounted(true);
  }, []);

  function toggleTheme(): void {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark",
    );

    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  }

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className="size-11 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }
      title={
        theme === "dark"
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }
      className="flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
    >
      {theme === "dark" ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
}