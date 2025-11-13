import ClientExpenseDetail from "./ClientExpenseDetail";
import { notFound } from "next/navigation";

// Next.js 15: searchParams là Promise → phải await
export default async function ExpenseDetailPage({
  searchParams,
}: {
  searchParams: Promise<{
    groupId?: string;
    expenseId?: string;
    actionType?: string;
  }>;
}) {
  // Await để lấy giá trị thực
  const params = await searchParams;

  const groupId = Number(params.groupId);
  const expenseId = Number(params.expenseId);
  const actionType = params.actionType || "view";

  if (isNaN(groupId) || isNaN(expenseId)) {
    notFound();
  }

  return (
    <ClientExpenseDetail
      groupId={groupId}
      expenseId={expenseId}
      actionType={actionType}
    />
  );
}