// src/app/(pages)/activities/payment-detail/ClientPaymentDetail.tsx
"use client";

import { useEffect, useState } from "react";
import CardDeletedPayment from "@/components/card/CardDeletedPayment";
import RestoreOnlyPage from "@/components/common/RestoreOnlyPage";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import CardPaymentActivity from "@/components/card/CardPaymentActivity";

interface ClientPaymentDetailProps {
  groupId: number;
  paymentId: number;
  actionType: string;
}

interface DeletedPayment {
  paymentId: number;
  groupId: number;
  groupName: string;
  payerId: number;
  payerName: string;
  payeeId: number;
  payeeName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  deletedAt: string;
}

export default function ClientPaymentDetail({
  groupId,
  paymentId,
  actionType,
}: ClientPaymentDetailProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [deletedPayment, setDeletedPayment] = useState<DeletedPayment | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const isDeleted = actionType.toLowerCase() === "delete";

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  // Lấy dữ liệu từ API payement-deleted
  useEffect(() => {
    if (!isDeleted || !userId) return;

    const fetchDeleted = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/payments/payement-deleted?size=50`
        );
        if (!res.ok) throw new Error("Không tải được");

        const data = await res.json();
        if (data.code === "success") {
          const found = data.data.content.find(
            (p: DeletedPayment) => p.paymentId === paymentId
          );
          setDeletedPayment(found || null);
        }
      } catch (err) {
        console.error("Lỗi tải thanh toán đã xóa:", err);
        toast.error("Không thể tải chi tiết!", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchDeleted();
  }, [isDeleted, groupId, paymentId, userId]);

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
      <RestoreOnlyPage groupId={groupId} entityId={paymentId} entityType="payment">
        {deletedPayment ? (
          <CardDeletedPayment payment={deletedPayment} />
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
            <p className="text-gray-500">Không tìm thấy thanh toán đã xóa. Có thể bạn đã khôi phục rồi chăng?</p>
          </div>
        )}
      </RestoreOnlyPage>
    );
  }

  // Trường hợp chưa xóa → dùng CardPaymentActivity bình thường
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <CardPaymentActivity paymentId={paymentId} groupId={groupId} />
      </div>
    </div>
  );
}