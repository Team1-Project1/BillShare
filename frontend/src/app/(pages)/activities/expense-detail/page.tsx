
import ClientExpenseDetail from "./ClientExpenseDetail";
import { notFound } from "next/navigation";

export default function ExpenseDetailPage({
  searchParams,
}: {
  searchParams: { groupId: string; expenseId: string };
}) {
  const groupId = Number(searchParams.groupId);
  const expenseId = Number(searchParams.expenseId);

  if (!groupId || !expenseId || isNaN(groupId) || isNaN(expenseId)) {
    notFound();
  }

  return <ClientExpenseDetail groupId={groupId} expenseId={expenseId} />;
}