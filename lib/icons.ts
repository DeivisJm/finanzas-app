import {
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  CreditCard,
  Folder,
  GraduationCap,
  House,
  Landmark,
  Laptop,
  Plane,
  ReceiptText,
  ShoppingBag,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

/**
 * Associates trusted icon identifiers with Lucide components.
 */
const iconRegistry: Record<string, LucideIcon> = {
  "briefcase-business": BriefcaseBusiness,
  building: Building2,
  "circle-dollar-sign": CircleDollarSign,
  "credit-card": CreditCard,
  folder: Folder,
  graduation: GraduationCap,
  house: House,
  landmark: Landmark,
  laptop: Laptop,
  plane: Plane,
  "receipt-text": ReceiptText,
  shopping: ShoppingBag,
  target: Target,
  "wallet-cards": WalletCards,
};

/**
 * Returns the registered icon or a generic folder icon.
 */
export function getIconComponent(
  iconName: string,
): LucideIcon {
  return iconRegistry[iconName] ?? Folder;
}