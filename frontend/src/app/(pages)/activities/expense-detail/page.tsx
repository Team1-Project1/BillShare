import ClientExpenseDetail from "./ClientExpenseDetail";
import { notFound } from "next/navigation";

export default function ExpenseDetailPage({
  searchParams,
}: {
  searchParams: { groupId?: string; expenseId?: string; actionType?: string };
}) {
  const groupId = Number(searchParams.groupId);
  const expenseId = Number(searchParams.expenseId);
  const actionType = searchParams.actionType || "view";

  if (isNaN(groupId) || isNaN(expenseId)) notFound();

  return (
    <ClientExpenseDetail
      groupId={groupId}
      expenseId={expenseId}
      actionType={actionType}
    />
  );
}