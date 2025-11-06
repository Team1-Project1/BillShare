// src/app/(pages)/activities/payment-detail/page.tsx
import ClientPaymentDetail from "./ClientPaymentDetail";
import { notFound } from "next/navigation";

export default function PaymentDetailPage({
  searchParams,
}: {
  searchParams: { groupId?: string; paymentId?: string; actionType?: string };
}) {
  const groupId = Number(searchParams.groupId);
  const paymentId = Number(searchParams.paymentId);
  const actionType = searchParams.actionType || "view";

  if (isNaN(groupId) || isNaN(paymentId)) notFound();

  return (
    <ClientPaymentDetail
      groupId={groupId}
      paymentId={paymentId}
      actionType={actionType}
    />
  );
}