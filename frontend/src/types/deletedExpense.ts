// src/types/deletedExpense.ts
// Định nghĩa chung cho DeletedExpense – dùng lại ở mọi nơi
export interface DeletedExpenseParticipant {
  participantId: number;
  expenseId: number;
  expenseName: string;
  userId: number;
  userName: string;
  userEmail: string;
  shareAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedExpense {
  expenseId: number;
  groupId: number;
  groupName: string;
  expenseName: string;
  totalAmount: number;
  currency: string;
  categoryId: number;
  categoryName: string;
  expenseDate: string;
  description: string;
  createdByUserId: number;
  createdByUserName: string;
  payerUserId: number;
  payerUserName: string;
  // Fix: dùng union type thay vì string
  splitMethod: "equal" | "custom";
  createdAt: string;
  updatedAt: string;
  participants: DeletedExpenseParticipant[];
  totalParticipants: number;
  deletedAt: string;
}