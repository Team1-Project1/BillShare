import ClientPaymentDetail from "./ClientPaymentDetail";
import { notFound } from "next/navigation";

// Next.js 15: searchParams là Promise → phải await
export default async function PaymentDetailPage({
  searchParams,
}: {
  searchParams: Promise<{
    groupId?: string;
    paymentId?: string;
    actionType?: string;
  }>;
}) {
  // Await để lấy giá trị thực
  const params = await searchParams;

  const groupId = Number(params.groupId);
  const paymentId = Number(params.paymentId);
  const actionType = params.actionType || "view";

  if (isNaN(groupId) || isNaN(paymentId)) {
    notFound();
  }

  return (
    <ClientPaymentDetail
      groupId={groupId}
      paymentId={paymentId}
      actionType={actionType}
    />
  );
}