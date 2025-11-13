// src/components/card/CardDeletedExpense.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiClock, FiTrash2, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { motion, AnimatePresence } from "framer-motion";

// Fix: Import interface chung, xóa định nghĩa trùng
import { DeletedExpense } from "@/types/deletedExpense";

interface Participant {
  userName: string;
  shareAmount: number;
  currency: string;
}

// Fix: Dùng interface chung, không cần định nghĩa lại
interface Props {
  expense: DeletedExpense;
}

export default function CardDeletedExpense({ expense }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${expense.groupId}/expenses/${expense.expenseId}/restore`,
        { method: "PUT" }
      );
      if (res.ok) {
        toast.success("Đã khôi phục khoản chi!", { position: "top-center" });
        window.location.reload();
      } else {
        toast.error("Không thể khôi phục!", { position: "top-center" });
      }
    } catch {
      toast.error("Lỗi kết nối!", { position: "top-center" });
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <FiTrash2 size={16} />
            <span className="text-sm font-medium">ĐÃ XÓA</span>
          </div>
          <h4 className="font-bold text-gray-900">{expense.expenseName}</h4>
          <p className="text-sm text-gray-600">
            {new Date(expense.expenseDate).toLocaleDateString("vi-VN")}
          </p>
          <p className="text-lg font-bold text-red-600">
            {expense.totalAmount.toLocaleString()} {expense.currency}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </div>
      </div>

      {/* Expandable Detail */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-red-200 bg-white"
          >
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#5BC5A7]">Nhóm:</span>
                <Link
                  href={`/group/detail/${expense.groupId}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {expense.groupName} <FiExternalLink size={12} />
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#5BC5A7]">Danh mục:</span>
                <span>{expense.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#5BC5A7]">Người trả:</span>
                <span>{expense.payerUserName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#5BC5A7]">Chia:</span>
                <span>{expense.splitMethod === "equal" ? "Chia đều" : "Tùy chỉnh"}</span>
              </div>
              {expense.description && (
                <div>
                  <span className="font-medium text-[#5BC5A7]">Mô tả:</span>
                  <p className="mt-1 text-gray-700">{expense.description}</p>
                </div>
              )}
              <div>
                <p className="font-medium text-[#5BC5A7] mb-2">
                  Thành viên ({expense.totalParticipants}):
                </p>
                <ul className="space-y-1">
                  {expense.participants.map((p, i) => (
                    <li key={i} className="flex justify-between text-xs">
                      <span>{p.userName}</span>
                      <span className="font-medium">
                        {p.shareAmount.toLocaleString()} {p.currency}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiClock size={12} /> Xóa: {new Date(expense.deletedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}