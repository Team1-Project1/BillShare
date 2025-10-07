"use client";

interface ModalExpenseDetailProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: number;
  groupId: number;
}

export default function ModalExpenseDetail({
  isOpen,
  onClose,
  expenseId,
  groupId,
}: ModalExpenseDetailProps) {
    if (!isOpen) return null;

    return (<div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-md bg-[#5BC5A7] text-white font-semibold hover:bg-[#4AA88C] transition-colors duration-300"
        >
          Đóng
        </button>
        Details
        </div>)
}