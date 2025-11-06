// src/app/(pages)/activities/payment-detail/ClientPaymentDetail.tsx
"use client";

import { useEffect, useState } from "react";
import CardPaymentActivity from "@/components/card/CardPaymentActivity";
import RestoreOnlyPage from "@/components/common/RestoreOnlyPage";

interface ClientPaymentDetailProps {
  groupId: number;
  paymentId: number;
  actionType: string;
}

export default function ClientPaymentDetail({ groupId, paymentId, actionType }: ClientPaymentDetailProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const isDeleted = actionType.toLowerCase() === "delete";

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  if (!userId) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
    </div>;
  }

  if (isDeleted) {
    return <RestoreOnlyPage groupId={groupId} entityId={paymentId} entityType="payment" />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <CardPaymentActivity paymentId={paymentId} groupId={groupId} />
      </div>
    </div>
  );
}