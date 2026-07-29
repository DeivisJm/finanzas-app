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