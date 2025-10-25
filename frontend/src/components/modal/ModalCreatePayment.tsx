'use client';

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ModalCreatePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  groupId?: number;
  payerId?: number | null;
  payeeId?: number;
  amount: number;
  currency: string;
}

export default function ModalCreatePayment({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  payerId,
  payeeId,
  amount,
  currency
}: ModalCreatePaymentProps) {

  const [paymentAmount, setPaymentAmount] = useState(amount);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setPaymentAmount(amount);
  }, [isOpen, amount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (paymentAmount <= 0) {
      toast.error("Số tiền phải lớn hơn 0", { position: "top-center", autoClose: 2000 });
      return;
    }
    if (paymentAmount > amount) {
      toast.error("Không thể thanh toán nhiều hơn số nợ!", { position: "top-center", autoClose: 2000 });
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
          },
          body: JSON.stringify({
            groupId: groupId,
            payerId: payerId,
            payeeId: payeeId,
            amount: paymentAmount,
            currency
          }),
        }
      );

      if (!response.ok) {
        toast.error("Thanh toán thất bại")
        return
      }

      if (response.ok) {
        toast.success(`Thanh toán ${paymentAmount.toLocaleString()} ${currency} thành công!`, {
          position: "top-center",
          autoClose: 2000,
        });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error("Có lỗi khi tạo thanh toán!", { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-5 animate-fadeIn border border-gray-200"
      >
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Thanh toán</h2>
        <p className="text-sm text-gray-600 mb-4">
          Nhập số tiền bạn muốn thanh toán cho khoản nợ:{" "}
          <span className="font-medium text-gray-900">
            {amount.toLocaleString()} {currency}
          </span>
        </p>

        {/* Ô nhập tiền */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số tiền thanh toán
        </label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(Number(e.target.value))}
          min={0}
          max={amount}
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:border-[#5BC5A7]"
        />
        {paymentAmount > amount && (
          <p className="text-xs text-red-500 mb-2">
            ⚠️ Số tiền không thể lớn hơn {amount.toLocaleString()} {currency}.
          </p>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${paymentAmount > amount || paymentAmount <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
              }`}
            disabled={paymentAmount > amount || paymentAmount <= 0}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
