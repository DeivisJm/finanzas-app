/**
 * Defines the functional behavior available to a project.
 */
export const PROJECT_TYPES = {
  STANDARD: "STANDARD",
  TRIP: "TRIP",
} as const;

export type ProjectType =
  (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES];

export interface ProjectSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string;
  type: ProjectType;
  sortOrder: number;
  folderCount: number;
  expenseCount: number;
  totalAmount: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  color: string;
  icon: string;
  type: ProjectType;
}

export type UpdateProjectInput = CreateProjectInput;