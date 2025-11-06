// src/components/card/CardExpenseActivity.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { categories } from "@/config/categories";
import { useRouter } from "next/navigation";

interface ExpenseDetail {
  expenseId: number;
  groupId: number;
  groupName: string;
  expenseName: string;
  totalAmount: number;
  currency: string;
  categoryName: string;
  categoryId: number;
  expenseDate: string;
  description: string;
  payerUserName: string;
  splitMethod: string;
  participants: Array<{
    participantId: number;
    userName: string;
    shareAmount: number;
  }>;
  totalParticipants: number;
}

interface CardExpenseActivityProps {
  expenseId: number;
  groupId: number;
  userId: number;
}

export default function CardExpenseActivity({ expenseId, groupId, userId }: CardExpenseActivityProps) {
  const [detail, setDetail] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseId}`
        );
        if (!res.ok) throw new Error("Không thể tải");
        const data = await res.json();
        if (data.code === "success") setDetail(data.data);
      } catch (err) {
        toast.error("Không thể tải chi tiết khoản chi!", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [expenseId, groupId]);

  if (loading) return <p className="text-center italic text-gray-500">Đang tải...</p>;
  if (!detail) return <p className="text-center italic text-red-500">Không tìm thấy khoản chi.</p>;

  const category = categories.find((c) => c.category_id === detail.categoryId);
  const icon = category?.icon || "note";

  const handleGroupClick = () => {
    router.push(`/group/detail/${groupId}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#5BC5A7]/10 p-3 rounded-full">
            <span style={{ fontSize: "24px" }}>{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{detail.expenseName}</h3>
            <p className="text-sm text-gray-600">
              {new Date(detail.expenseDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#5BC5A7]">
            {detail.totalAmount.toLocaleString()} {detail.currency}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm border-t pt-4">
        <div className="flex justify-between">
          <span className="font-medium text-[#5BC5A7]">Nhóm:</span>
          <button
            onClick={handleGroupClick}
            className="text-[#5BC5A7] font-medium hover:underline cursor-pointer"
          >
            {detail.groupName}
          </button>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#5BC5A7]">Danh mục:</span>
          <span>{detail.categoryName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#5BC5A7]">Mô tả:</span>
          <span>{detail.description || "Không có"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#5BC5A7]">Người trả:</span>
          <span>{detail.payerUserName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-[#5BC5A7]">Chia:</span>
          <span>{detail.splitMethod === "equal" ? "Chia đều" : "Tùy chỉnh"}</span>
        </div>

        <div>
          <p className="font-medium text-[#5BC5A7] mb-2">
            Thành viên ({detail.totalParticipants}):
          </p>
          <ul className="space-y-1">
            {detail.participants.map((p) => (
              <li key={p.participantId} className="flex justify-between">
                <span>{p.userName}</span>
                <span className="font-medium">
                  {p.shareAmount.toLocaleString()} {detail.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}