import type { ProjectType } from "@/types/project";
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  GraduationCap,
  House,
  Laptop,
  Plane,
  ShoppingBag,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface ProjectIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
  projectType: ProjectType;
}

export const PROJECT_COLOR_OPTIONS = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#52525b",
] as const;

export const PROJECT_ICON_OPTIONS: ProjectIconOption[] = [
  {
    value: "credit-card",
    label: "Tarjetas",
    icon: CreditCard,
    projectType: "STANDARD",
  },
  {
    value: "plane",
    label: "Viajes",
    icon: Plane,
    projectType: "TRIP",
  },
  {
    value: "briefcase-business",
    label: "Trabajo",
    icon: BriefcaseBusiness,
    projectType: "STANDARD",
  },
  {
    value: "house",
    label: "Hogar",
    icon: House,
    projectType: "STANDARD",
  },
  {
    value: "graduation",
    label: "Estudios",
    icon: GraduationCap,
    projectType: "STANDARD",
  },
  {
    value: "shopping",
    label: "Compras",
    icon: ShoppingBag,
    projectType: "STANDARD",
  },
  {
    value: "laptop",
    label: "Tecnología",
    icon: Laptop,
    projectType: "STANDARD",
  },
  {
    value: "building",
    label: "Negocio",
    icon: Building2,
    projectType: "STANDARD",
  },
  {
    value: "target",
    label: "Meta",
    icon: Target,
    projectType: "STANDARD",
  },
];