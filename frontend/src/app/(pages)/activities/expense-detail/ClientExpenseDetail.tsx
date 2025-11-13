// src/app/(pages)/activities/expense-detail/ClientExpenseDetail.tsx
"use client";

import { useEffect, useState } from "react";
import CardDeletedExpense from "@/components/card/CardDeletedExpense";
import RestoreOnlyPage from "@/components/common/RestoreOnlyPage";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import CardExpenseActivity from "@/components/card/CardExpenseActivity";

// Fix: Import interface chung thay vì tự định nghĩa
import { DeletedExpense } from "@/types/deletedExpense";

export default function ClientExpenseDetail({
  groupId,
  expenseId,
  actionType,
}: {
  groupId: number;
  expenseId: number;
  actionType: string;
}) {
  const [userId, setUserId] = useState<number | null>(null);
  // Fix: Dùng interface chung
  const [deletedExpense, setDeletedExpense] = useState<DeletedExpense | null>(null);
  const [loading, setLoading] = useState(false);
  const isDeleted = actionType === "delete";

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  useEffect(() => {
    if (!isDeleted || !userId) return;

    const fetchDeleted = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/expenses-deleted?size=50`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.code === "success") {
          const found = data.data.content.find(
            // Fix: Dùng kiểu DeletedExpense từ file chung
            (e: DeletedExpense) => e.expenseId === expenseId
          );
          setDeletedExpense(found || null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải chi tiết!", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchDeleted();
  }, [isDeleted, groupId, expenseId, userId]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  if (isDeleted) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
        </div>
      );
    }

    return (
      <RestoreOnlyPage groupId={groupId} entityId={expenseId} entityType="expense">
        {deletedExpense ? (
          // Fix: Truyền đúng kiểu DeletedExpense (giờ đã đồng nhất)
          <CardDeletedExpense expense={deletedExpense} />
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
            <p className="text-gray-500">Không tìm thấy khoản chi đã xóa. Có thể bạn đã khôi phục rồi chăng?</p>
          </div>
        )}
      </RestoreOnlyPage>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <CardExpenseActivity expenseId={expenseId} groupId={groupId} userId={userId} />
      </div>
    </div>
  );
}