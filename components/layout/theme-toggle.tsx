"use client";

import {
  Moon,
  Sun,
} from "lucide-react";
import {
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT =
  "wallet-pro-theme-change";

/**
 * Reads the current theme from the document root.
 */
function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains(
    "dark",
  )
    ? "dark"
    : "light";
}

/**
 * Provides a stable server snapshot during hydration.
 */
function getServerThemeSnapshot(): Theme {
  return "light";
}

/**
 * Subscribes to local and cross-tab theme changes.
 */
function subscribeToTheme(
  callback: () => void,
): () => void {
  function handleStorage(
    event: StorageEvent,
  ): void {
    if (event.key === "theme") {
      callback();
    }
  }

  window.addEventListener(
    THEME_CHANGE_EVENT,
    callback,
  );

  window.addEventListener(
    "storage",
    handleStorage,
  );

  return () => {
    window.removeEventListener(
      THEME_CHANGE_EVENT,
      callback,
    );

    window.removeEventListener(
      "storage",
      handleStorage,
    );
  };
}

/**
 * Allows the user to switch between light and dark appearance.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme(): void {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark",
    );

    localStorage.setItem(
      "theme",
      nextTheme,
    );

    window.dispatchEvent(
      new Event(THEME_CHANGE_EVENT),
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }
      title={
        isDark
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }
      className="flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
    >
      {isDark ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
}