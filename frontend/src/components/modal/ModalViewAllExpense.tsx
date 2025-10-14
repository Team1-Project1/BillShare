"use client";

import { useEffect, useRef, useState } from "react";
import { FiClipboard, FiTrash2 } from "react-icons/fi";
import CardExpense from "../card/CardExpense";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";

interface Expense {
  expenseId: number;
  groupId: number;
  name: string;
  date: string;
  amount: number;
  currency: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  // debt: number;
}

interface ModalViewAllExpensesProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  groupId: number;
  userId: number;
  currency: string;
  members: Member[];
  onDeleteSuccess: () => void;
  onEditSuccess: () => void;
}

export default function ModalViewAllExpenses({
  isOpen,
  onClose,
  expenses,
  groupId,
  userId,
  currency,
  members,
  onDeleteSuccess,
  onEditSuccess,
}: ModalViewAllExpensesProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);

  const handleSelectExpense = (expenseId: number) => {
    setSelectedExpenses((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleDeleteExpenses = async () => {
    if (selectedExpenses.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một khoản chi để xóa!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const canDeletePromises = selectedExpenses.map(async (expenseId) => {
        const detailResponse = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );

        if (!detailResponse.ok) {
          throw new Error(`Không thể lấy chi tiết khoản chi ID ${expenseId}`);
        }

        const detailData = await detailResponse.json();
        if (detailData.code !== "success") {
          throw new Error(detailData.message);
        }

        return detailData.data.createdByUserId === userId;
      });

      const canDeleteResults = await Promise.all(canDeletePromises);
      if (!canDeleteResults.every((canDelete) => canDelete)) {
        toast.error("Bạn không có quyền xóa một số khoản chi đã chọn!", {
          position: "top-center",
          autoClose: 2000,
        });
        return;
      }

      const deletePromises = selectedExpenses.map(async (expenseId) => {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
              userId: userId.toString(),
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Không thể xóa khoản chi ID ${expenseId}`
          );
        }
      });

      await Promise.all(deletePromises);

      toast.success(`Đã xóa ${selectedExpenses.length} khoản chi thành công!`, {
        position: "top-center",
        autoClose: 2000,
      });
      setSelectedExpenses([]);
      onDeleteSuccess();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Có lỗi xảy ra khi xóa các khoản chi!", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

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
            Danh sách tất cả khoản chi trong nhóm ({selectedExpenses.length} đã
            chọn)
          </p>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <CardExpense
                key={expense.expenseId}
                expenseId={expense.expenseId}
                groupId={groupId}
                name={expense.name}
                date={expense.date}
                amount={expense.amount}
                currency={currency}
                userId={userId}
                isSelected={selectedExpenses.includes(expense.expenseId)}
                onSelect={() => handleSelectExpense(expense.expenseId)}
                showDeleteOptions={true}
                onDeleteSuccess={onDeleteSuccess}
                onEditSuccess={onEditSuccess}
                onClose={onClose}
                members={members}
              />
            ))
          ) : (
            <p className="text-gray-600 italic text-center">
              Nhóm này chưa có khoản chi nào.
            </p>
          )}
        </div>

        <button
          onClick={handleDeleteExpenses}
          disabled={selectedExpenses.length === 0}
          className={`w-full h-12 bg-red-500 text-white rounded-md text-base font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4 ${
            selectedExpenses.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiTrash2 className="mr-2" /> Xóa {selectedExpenses.length} khoản chi
        </button>
      </div>
    </div>
  );
}