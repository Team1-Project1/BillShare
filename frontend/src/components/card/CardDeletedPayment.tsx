// src/components/card/CardDeletedPayment.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiClock, FiTrash2, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { motion, AnimatePresence } from "framer-motion";

interface DeletedPayment {
  paymentId: number;
  groupId: number;
  groupName: string;
  payerName: string;
  payeeName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  deletedAt: string;
}

interface Props {
  payment: DeletedPayment;
}

export default function CardDeletedPayment({ payment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${payment.groupId}/payments/${payment.paymentId}/restore`,
        { method: "PUT" }
      );
      if (res.ok) {
        toast.success("Đã khôi phục thanh toán!", { position: "top-center" });
        window.location.reload();
      } else {
        toast.error("Không thể khôi phục!", { position: "top-center" });
      }
    } catch {
      toast.error("Lỗi!", { position: "top-center" });
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <FiTrash2 size={16} />
            <span className="text-sm font-medium">ĐÃ XÓA</span>
          </div>
          <p className="font-medium text-gray-800">
            {payment.payerName} → {payment.payeeName}
          </p>
          <p className="text-lg font-bold text-red-600">
            {payment.amount.toLocaleString()} {payment.currency}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(payment.paymentDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-red-200 bg-white p-4 space-y-2 text-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-[#5BC5A7]">Nhóm:</span>
              <Link
                href={`/group/detail/${payment.groupId}`}
                className="text-blue-600 hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {payment.groupName} <FiExternalLink size={12} />
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[#5BC5A7]">Thời gian:</span>
              <span>{new Date(payment.paymentDate).toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiClock size={12} /> Xóa: {new Date(payment.deletedAt).toLocaleString("vi-VN")}
              </p>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}