import { FiUser } from "react-icons/fi";

interface CardFriendEnhancedProps {
  name: string;
  debt: number;
  received: number;
}

export default function CardFriendEnhanced({ name, debt, received }: CardFriendEnhancedProps) {
  const netAmount = received - debt;
  const amountColor = netAmount >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <FiUser className="text-[#5BC5A7] mr-2" />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <div className="text-xs text-gray-600">
            <p>Nợ: {debt.toLocaleString()} đ</p>
            <p>Nhận: {received.toLocaleString()} đ</p>
          </div>
        </div>
      </div>
      <span className={`text-sm font-semibold ${amountColor}`}>
        {netAmount >= 0 ? "+" : ""}{netAmount.toLocaleString()} đ
      </span>
    </div>
  );
}