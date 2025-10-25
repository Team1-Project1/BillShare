"use client";

import { useState } from "react";
import { FiUser, FiDollarSign, FiBell } from "react-icons/fi";
import ModalCreatePayment from "@/components/modal/ModalCreatePayment";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";

interface CardFriendEnhancedProps {
  name: string;
  debt: number;
  isOwed?: boolean;
  currency: string;
  isLoading?: boolean;
  groupId?: number;
  payerId?: number | null;
  payeeId?: number;
  onSuccess?: () => void;
}

export default function CardFriendEnhanced({
  name,
  debt,
  isOwed,
  currency,
  isLoading,
  groupId,
  payerId,
  payeeId,
  onSuccess,
}: CardFriendEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSendDebtReminder = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}/send-debt-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        toast.error("Nhắc nợ thất bại");
        return;
      }

      toast.success(`Đã nhắc nợ các thành viên trong nhóm`, {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error("Có lỗi khi nhắc nợ!", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 flex items-center justify-between hover:shadow-lg transition-all duration-300">
        <div className="flex items-center">
          <FiUser className="text-[#5BC5A7] mr-3 text-xl" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
            <p className="text-xs text-gray-600 mt-1">
              {isLoading
                ? "Đang tải..."
                : debt === 0
                ? "Không nợ"
                : isOwed
                ? `Đang nợ bạn: ${debt.toLocaleString()} ${currency}`
                : `Bạn đang nợ: ${debt.toLocaleString()} ${currency}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`text-sm font-semibold mb-2 ${
              isLoading || debt === 0
                ? "text-gray-600"
                : !isOwed
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {isLoading
              ? "Đang tải..."
              : debt === 0
              ? `${debt.toLocaleString()} ${currency}`
              : !isOwed
              ? `-${debt.toLocaleString()} ${currency}`
              : `+${debt.toLocaleString()} ${currency}`}
          </span>

          {debt !== 0 && !isLoading && (
            <button
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 ${
                !isOwed
                  ? "bg-[#5BC5A7] text-white hover:bg-[#4AA88C] hover:shadow-md"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:shadow-md"
              }`}
              onClick={() =>
                !isOwed ? setIsOpen(true) : handleSendDebtReminder()
              }
            >
              {!isOwed ? (
                <>
                  <FiDollarSign className="text-base" />
                  Thanh toán
                </>
              ) : (
                <>
                  <FiBell className="text-base" />
                  Nhắc nợ
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ModalCreatePayment
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
        groupId={groupId}
        payerId={payerId}
        payeeId={payeeId}
        amount={debt}
        currency={currency}
      />
    </>
  );
}
