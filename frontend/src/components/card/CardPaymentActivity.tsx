// src/components/card/CardPaymentActivity.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";

interface PaymentDetail {
  paymentId: number;
  groupId: number;
  groupName: string;
  payerName: string;
  payeeName: string;
  amount: number;
  currency: string;
  paymentDate: string;
}

interface CardPaymentActivityProps {
  paymentId: number;
  groupId: number;
}

export default function CardPaymentActivity({
  paymentId,
  groupId,
}: CardPaymentActivityProps) {
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/payments/${paymentId}`
        );
        if (!res.ok) throw new Error("Không thể tải");
        const data = await res.json();
        if (data.code === "success") setDetail(data.data);
      } catch (err) {
        toast.error("Không thể tải chi tiết thanh toán!", {
          position: "top-center",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [paymentId, groupId]);

  if (loading) return <p className="text-center italic">Đang tải...</p>;
  if (!detail)
    return (
      <p className="text-center italic text-red-500">
        Không tìm thấy thanh toán.
      </p>
    );

  const handleGroupClick = () => {
    router.push(`/group/detail/${groupId}`);
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-200">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-3xl">💸</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
          Khoản thanh toán
        </h3>
      </div>

      <div className="space-y-6 text-base md:text-lg">
        {/* Người trả */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-1">
          <span className="font-medium text-[#5BC5A7]">Từ:</span>
          <span className="font-bold text-green-600">{detail.payerName}</span>
        </div>

        {/* Số tiền */}
        <div className="flex justify-center text-2xl md:text-3xl font-bold text-[#5BC5A7]">
          → {detail.amount.toLocaleString()} {detail.currency} →
        </div>

        {/* Người nhận */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-1">
          <span className="font-medium text-[#5BC5A7]">Đến:</span>
          <span className="font-bold text-red-600">{detail.payeeName}</span>
        </div>

        {/* Info */}
        <div className="border-t pt-4 mt-4 space-y-3">
          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="font-medium text-[#5BC5A7]">Nhóm:</span>
            <button
              onClick={handleGroupClick}
              className="text-[#5BC5A7] font-medium hover:underline"
            >
              {detail.groupName}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between">
            <span className="font-medium text-[#5BC5A7]">Thời gian:</span>
            <span>{new Date(detail.paymentDate).toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}