"use client";

import { useEffect, useState } from "react";
import CardExpense from "@/components/card/CardExpense";
import { BottomNav } from "@/components/Footer/BottomNav";

interface ClientExpenseDetailProps {
  groupId: number;
  expenseId: number;
}

export default function ClientExpenseDetail({ groupId, expenseId }: ClientExpenseDetailProps) {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-[#5BC5A7] mb-4">Chi tiết khoản chi</h2>
          <CardExpense
            expenseId={expenseId}
            groupId={groupId}
            name=""
            date=""
            amount={0}
            currency="VND"
            userId={userId}
            showDeleteOptions={false}
          />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}