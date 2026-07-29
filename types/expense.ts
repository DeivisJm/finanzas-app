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

export interface CreateExpenseInput {
  text: string;
  expenseDate?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  expenseDate?: string;
}

export interface ExpenseSummary {
  pendingCount: number;
  pendingAmount: number;
}