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