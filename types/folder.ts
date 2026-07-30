export interface FolderSummary {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  projectId: number;
  expenseCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface CreateFolderInput {
  name: string;
  color: string;
  icon: string;
  projectId: number;
}

export interface UpdateFolderInput {
  name: string;
  color: string;
  icon: string;
}