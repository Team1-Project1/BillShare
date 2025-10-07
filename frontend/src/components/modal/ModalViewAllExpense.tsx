"use client";

import { useEffect, useRef, useState } from "react";
import { FiClipboard } from "react-icons/fi";
import CardExpense from "../card/CardExpense"; 

interface Expense {
  expenseId: number;
  groupId: number
  name: string;
  date: string;
  amount: number;
}

interface ModalViewAllExpensesProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  groupId: number;
  canDelete?: boolean;
}

export default function ModalViewAllExpenses({
  isOpen,
  onClose,
  expenses,
  groupId,
  canDelete = true,
}: ModalViewAllExpensesProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDeleteExpense = async (expenseId: number, groupId: number) => {
    // Logic to delete expense
  };
  // Đóng modal khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        ></div>
      
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">
            Tất cả khoản chi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center">
          <FiClipboard className="text-[#5BC5A7] mr-2" />
          <p className="text-[16px] text-gray-700">
            Danh sách tất cả khoản chi trong nhóm
          </p>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {expenses.map((expense) => (
              <CardExpense
                key={expense.expenseId}
                expenseId={expense.expenseId}
                groupId={groupId}
                name={expense.name}
                date={expense.date}
                amount={expense.amount}
                showDelete={canDelete}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic text-center">
            Nhóm này chưa có khoản chi nào.
          </p>
        )}
      </div>
    </div>
  );
}
