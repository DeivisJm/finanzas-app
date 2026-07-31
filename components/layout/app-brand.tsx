import Image from "next/image";

interface AppBrandProps {
  compact?: boolean;
}

/**
 * Displays the Wallet Pro identity using the appropriate
 * logo version for the active light or dark theme.
 */
export function AppBrand({
  compact = false,
}: AppBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${
          compact ? "size-10" : "size-12"
        }`}
      >
        <Image
          src="/branding/wallet-pro-light.png"
          alt="Wallet Pro"
          fill
          priority
          sizes={compact ? "40px" : "48px"}
          className="object-cover dark:hidden"
        />

        <Image
          src="/branding/wallet-pro-dark.png"
          alt="Wallet Pro"
          fill
          priority
          sizes={compact ? "40px" : "48px"}
          className="hidden object-cover dark:block"
        />
      </div>

      <div className="min-w-0">
        <p
          className={`truncate font-semibold tracking-tight text-zinc-950 dark:text-white ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          Wallet Pro
        </p>

        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          Panel financiero
        </p>
      </div>
    </div>
  );
}