import {
  CircleDollarSign,
  CreditCard,
  Folder,
  Landmark,
  Plane,
  ReceiptText,
  Target,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps icon identifiers stored in the database to trusted Lucide components.
 *
 * This prevents arbitrary SVG or HTML content from being rendered.
 */
const iconRegistry: Record<string, LucideIcon> = {
  "circle-dollar-sign": CircleDollarSign,
  "credit-card": CreditCard,
  folder: Folder,
  landmark: Landmark,
  plane: Plane,
  "receipt-text": ReceiptText,
  target: Target,
};

/**
 * Returns the icon registered for the supplied identifier.
 *
 * Falls back to the generic Folder icon when the identifier is unknown.
 */
export function getIconComponent(iconName: string): LucideIcon {
  return iconRegistry[iconName] ?? Folder;
}