"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react"; // SỬA: Thêm useCallback
import { FiArrowRight, FiDollarSign, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

interface Payment {
  paymentId: number;
  groupId: number;
  payerName: string;
  payeeName: string;
  amount: number;
  currency: string;
  paymentDate: string;
}

interface PaymentDetail {
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
}

interface CardPaymentProps {
  payment: Payment;
  onDeletePaymentSuccess: () => void;
}

export default function CardPayment({
  payment,
  onDeletePaymentSuccess,
}: CardPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(payment.amount);
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const formattedDate = new Date(payment.paymentDate).toLocaleString("vi-VN");

  const fetchPaymentDetail = useCallback(async () => { // SỬA: Gói bằng useCallback
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${payment.groupId}/payments/${payment.paymentId}`
      );

      const data = await response.json();
      if (data.code === "success") {
        setDetail(data.data);
        setNewAmount(data.data.amount);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể tải chi tiết khoản chi trả!");
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [payment.groupId, payment.paymentId]); // SỬA: Thêm dependency

  const updatePayment = async () => {
    if (!detail) return;
    if (newAmount <= 0) {
      toast.warn("Số tiền phải lớn hơn 0!");
      return;
    }
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${detail.groupId}/payments/${detail.paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: detail.groupId,
            payerId: detail.payerId,
            payeeId: detail.payeeId,
            amount: newAmount,
            currency: detail.currency,
          }),
        }
      );

      if (response.status === 500) {
        toast.error("Không thể sửa chi trả của người khác.  ");
      }

      const data = await response.json();

      if (data.code === "success") {
        toast.success("Cập nhật chi trả thành công!", {
          position: "top-center",
          autoClose: 2000,
        });
        setIsEditing(false);
        setIsOpen(false);
        onDeletePaymentSuccess();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể cập nhật chi trả!");
    }
  };

  // Thêm hàm restore
  const handleRestore = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${payment.groupId}/payments/${payment.paymentId}/restore`,
        { method: "PUT" }
      );
      if (res.ok) {
        toast.success("Đã khôi phục!");
        onDeletePaymentSuccess();
      }
    } catch {
      toast.error("Không thể khôi phục!");
    }
  };


  const deletePayment = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${payment.groupId}/payments/${payment.paymentId}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.code === "success") {
        toast.success("Đã xóa chi trả!", {
          autoClose: 2000,
          position: "top-center",
        });
        onDeletePaymentSuccess();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể xóa chi trả!");
    }
  };

  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchPaymentDetail();
      setNewAmount(payment.amount);
    }
  }, [isOpen, hasFetched, fetchPaymentDetail, payment.amount]); // SỬA: Thêm dependencies

  return (
    <div className="mb-3">
      {/* Main card */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-4 py-3 rounded-xl shadow-md border border-gray-200 flex items-center cursor-pointer hover:bg-gray-50"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#5BC5A7] to-[#3A8F77] rounded-full flex items-center justify-center text-white mr-3">
          <FiDollarSign size={18} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-800 font-medium flex gap-1 flex-wrap">
            <span className="text-[#4BA08A]">{payment.payerName}</span>
            <FiArrowRight size={14} className="text-[#5BC5A7]" />
            <span>{payment.payeeName}</span>
          </p>

          <p className="text-gray-600 text-sm font-semibold">
            {payment.amount.toLocaleString()} {payment.currency}
          </p>
          <p className="text-[11px] text-gray-500">{formattedDate}</p>
        </div>
      </motion.div>

      {/* Detail expand */}
      <AnimatePresence>
        
        {isOpen && (
          <motion.div
            className="bg-[#F7FAF9] rounded-xl border border-gray-200 border-t-0 shadow-sm p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isLoading || !detail ? (
              <p className="italic text-gray-600 animate-pulse">Đang tải...</p>
            ) : (
              <>
                <DetailItem label="Nhóm" value={detail.groupName} />
                <DetailItem label="Người trả" value={detail.payerName} />
                <DetailItem label="Người nhận" value={detail.payeeName} />
                <DetailItem label="Thời gian trả" value={formattedDate} />

                {/* Amount editing */}
                <div>
                  <label className="block text-sm font-medium text-[#5BC5A7] mb-1">
                    Số tiền
                  </label>

                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        pattern="[0-9]*"
                        min="0"
                        value={newAmount === 0 ? "" : newAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setNewAmount(0);
                          } else {
                            const num = parseFloat(value);
                            setNewAmount(isNaN(num) ? 0 : num);
                          }
                        }}
                        className="w-full px-2 py-1 border rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
                      />
                      <button
                        onClick={updatePayment}
                        className="p-2 bg-[#5BC5A7] text-white rounded-md"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 bg-gray-300 text-gray-800 rounded-md"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <p
                      className="text-gray-700 font-medium cursor-pointer hover:underline"
                      onClick={() => setIsEditing(true)}
                    >
                      {detail.amount.toLocaleString()} {detail.currency}
                    </p>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#5BC5A7] text-white rounded-md"
                  >
                    Sửa chi trả
                  </button>
                  <button
                    onClick={deletePayment}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Xóa chi trả
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// SỬA: Đổi 'any' thành 'React.ReactNode'
function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-gray-700 text-sm">
      <span className="font-medium text-[#5BC5A7]">{label}:</span>
      <span className="max-w-[60%] text-right">{value}</span>
    </div>
  );
}