export const APP_ICON_NAMES = [
  "briefcase-business",
  "building",
  "circle-dollar-sign",
  "credit-card",
  "folder",
  "graduation",
  "house",
  "landmark",
  "laptop",
  "plane",
  "receipt-text",
  "shopping",
  "target",
  "wallet-cards",
] as const;

export type AppIconName =
  (typeof APP_ICON_NAMES)[number];

/**
 * Checks whether a persisted value is a supported application icon.
 */
export function isAppIconName(
  value: string,
): value is AppIconName {
  return APP_ICON_NAMES.includes(
    value as AppIconName,
  );
}

/**
 * Returns a safe icon identifier for values loaded from persistence.
 */
export function normalizeAppIconName(
  value: string,
): AppIconName {
  return isAppIconName(value)
    ? value
    : "folder";
}