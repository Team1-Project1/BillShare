"use client";

import { FiUser } from "react-icons/fi";

interface CardFriendEnhancedProps {
  name: string;
  debt: number;
  currency: string; // Thêm prop currency
  isLoading?: boolean;
}

export default function CardFriendEnhanced({ name, debt, currency, isLoading }: CardFriendEnhancedProps) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <FiUser className="text-[#5BC5A7] mr-2" />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <p className="text-xs text-gray-600">
            {isLoading ? "Đang tải..." : `Nợ: ${debt.toLocaleString()} ${currency}`}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-semibold ${
          isLoading ? "text-gray-600" : debt > 0 ? "text-red-600" : "text-green-600"
        }`}
      >
        {isLoading ? "Đang tải..." : debt > 0 ? `-${debt.toLocaleString()} ${currency}` : `0 ${currency}`}
      </span>
    </div>
  );
}