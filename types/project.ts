export interface ProjectSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string;
  sortOrder: number;
  folderCount: number;
  expenseCount: number;
  totalAmount: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface UpdateProjectInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
}