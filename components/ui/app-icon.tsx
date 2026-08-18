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
  type LucideProps,
} from "lucide-react";

interface AppIconProps extends LucideProps {
  name: string;
}

/**
 * Renders a trusted application icon using its persisted identifier.
 *
 * The component types remain statically declared so React does not
 * recreate component definitions during rendering.
 */
export function AppIcon({
  name,
  ...props
}: AppIconProps) {
  switch (name) {
    case "briefcase-business":
      return <BriefcaseBusiness {...props} />;

    case "building":
      return <Building2 {...props} />;

    case "circle-dollar-sign":
      return <CircleDollarSign {...props} />;

    case "credit-card":
      return <CreditCard {...props} />;

    case "graduation":
      return <GraduationCap {...props} />;

    case "house":
      return <House {...props} />;

    case "landmark":
      return <Landmark {...props} />;

    case "laptop":
      return <Laptop {...props} />;

    case "plane":
      return <Plane {...props} />;

    case "receipt-text":
      return <ReceiptText {...props} />;

    case "shopping":
      return <ShoppingBag {...props} />;

    case "target":
      return <Target {...props} />;

    case "wallet-cards":
      return <WalletCards {...props} />;

    case "folder":
    default:
      return <Folder {...props} />;
  }
}