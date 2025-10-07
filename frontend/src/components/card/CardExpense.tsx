import { useState } from "react";
import ModalExpenseDetail from "@/components/modal/ModalExpenseDetail";
import { FiTrash2 } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";

interface CardExpenseProps {
  expenseId: number;
  groupId: number;
  name: string;
  date: string;
  amount: number;
  showDelete?: boolean; 
  onDelete?: (expenseId: number, groupId: number) => void;
}

export default function CardBill({
  expenseId,
  groupId,
  name, 
  date, 
  amount,
  showDelete = false,
  onDelete, 
}: CardExpenseProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // tránh mở modal chi tiết
    if (onDelete) onDelete(expenseId, groupId);
  };


  return (
    <>
    <div 
      onClick={() => setIsModalOpen(true)}
      className="cursor-pointer bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
          <div className="bg-[#5BC5A7]/10 p-2 rounded-full">
            <FiFileText className="text-[#5BC5A7]" size={18} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{name}</h4>
            <p className="text-xs text-gray-600">
              {new Date(date).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-[#5BC5A7]">
          {amount.toLocaleString()} VND
        </span>

        {showDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-md hover:bg-red-100 transition-colors"
            title="Xóa khoản chi"
          >
            <FiTrash2 className="text-red-500" size={16} />
          </button>
        )}
    </div>

    <ModalExpenseDetail
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      expenseId={expenseId}
      groupId={groupId}
    />

    </>
  );
}