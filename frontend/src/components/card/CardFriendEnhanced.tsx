"use client";

import { useState } from "react";
import { FiUser } from "react-icons/fi";
import ModalCreatePayment from "@/components/modal/ModalCreatePayment";

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

export default function CardFriendEnhanced({ name, debt, isOwed,currency, isLoading, groupId, payerId, payeeId, onSuccess}: CardFriendEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <FiUser className="text-[#5BC5A7] mr-2" />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <p className="text-xs text-gray-600">
            {isLoading ? "Đang tải..."
            : debt === 0
            ? "Không nợ"
            : isOwed 
            ? `Đang nợ bạn: ${debt.toLocaleString()} ${currency}` 
            : `Bạn đang nợ: ${debt.toLocaleString()} ${currency}`}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-semibold ${
          isLoading || debt === 0 ? "text-gray-600" : !isOwed ? "text-red-600" : "text-green-600"
        }`}
      >
        {isLoading  ? "Đang tải..." 
                    : debt === 0 
                    ? `${debt.toLocaleString()} ${currency}` 
                    : !isOwed 
                    ? `-${debt.toLocaleString()} ${currency}` 
                    : `+${debt.toLocaleString()} ${currency}`}
      </span>
      
      {debt !== 0 && !isLoading && (
          <button
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-300 ${
              !isOwed
                ? "bg-[#5BC5A7] text-white hover:bg-[#4AA88C]"
                : "bg-yellow-200 text-yellow-800 hover:bg-yellow-200"
            }`}
            onClick={() =>
              !isOwed
                ? setIsOpen(true)
                : alert(`Bạn đã nhắc nợ ${name}`)
            }
          >
            {!isOwed ? "Thanh toán" : "Nhắc nợ"}
          </button>
        )}
    </div>

    <ModalCreatePayment
      isOpen= {isOpen}
      onClose= {() => setIsOpen(false)}
      onSuccess={onSuccess}
      groupId= {groupId}
      payerId= {payerId}
      payeeId= {payeeId}
      amount= {debt}
      currency= {currency}
    />
    </>
  );
}