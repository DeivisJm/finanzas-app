export interface Expense {
  id: number;
  description: string;
  amount: number;
  expenseDate: string;
  isPaid: boolean;
  paidAt: string | null;
  folderId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditableExpenseData {
  description: string;
  amount: number;
  expenseDate: string;
}