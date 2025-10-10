"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import ModalEditExpense from "@/components/modal/ModalEditExpense";
import { categories } from "@/config/categories";

interface Participant {
  participantId: number;
  userId: number;
  userName: string;
  userEmail: string;
  shareAmount: number;
  currency: string;
}

interface ExpenseDetail {
  expenseId: number;
  groupId: number;
  groupName: string;
  expenseName: string;
  totalAmount: number;
  currency: string;
  categoryName: string;
  categoryId: number;
  expenseDate: string;
  description: string;
  createdByUserName: string;
  payerUserName: string;
  payerUserId: number;
  splitMethod: string;
  participants: Participant[];
  totalParticipants: number;
  createdByUserId: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  debt: number;
}

interface CardExpenseProps {
  expenseId: number;
  groupId: number;
  name: string;
  date: string;
  amount: number;
  currency: string;
  userId: number;
  isSelected?: boolean;
  onSelect?: () => void;
  showDeleteOptions?: boolean;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  onClose?: () => void;
  members?: Member[];
}

export default function CardExpense({
  expenseId,
  groupId,
  name,
  date,
  amount,
  currency,
  userId,
  isSelected = false,
  onSelect,
  showDeleteOptions = false,
  onDeleteSuccess,
  onEditSuccess,
  onClose,
  members = [],
}: CardExpenseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseDetail, setExpenseDetail] = useState<ExpenseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchExpenseDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }
        throw new Error("Không thể tải chi tiết khoản chi");
      }

      const data = await response.json();
      if (data.code === "success") {
        setExpenseDetail(data.data);
        setCanDelete(data.data.createdByUserId === userId);
        setHasFetched(true);
      } else {
        toast.error(data.message, { position: "top-center", autoClose: 2000 });
        setCanDelete(false);
        setHasFetched(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải chi tiết khoản chi!", {
        position: "top-center",
        autoClose: 2000,
      });
      setCanDelete(false);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched && (showDeleteOptions || isOpen)) {
      fetchExpenseDetail();
    }
  }, [expenseId, groupId, userId, showDeleteOptions, isOpen, hasFetched]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect && canDelete) {
      onSelect();
    } else if (!canDelete) {
      toast.warn("Bạn không có quyền chọn khoản chi này để xóa!", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showDeleteOptions) {
      if (
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLButtonElement) &&
        onSelect &&
        canDelete
      ) {
        onSelect();
      } else if (!canDelete) {
        toast.warn("Bạn không có quyền chọn khoản chi này để xóa!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } else {
      handleToggle();
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDelete) {
      toast.error("Bạn không có quyền xóa khoản chi này!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
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
          errorData.message || `Không thể xóa khoản chi "${name}"`
        );
      }

      toast.success(`Đã xóa khoản chi: ${name}`, {
        position: "top-center",
        autoClose: 2000,
      });
      if (onDeleteSuccess) onDeleteSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`Không thể xóa khoản chi "${name}"`, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  // Lấy biểu tượng từ categories dựa trên categoryId
  const category = categories.find((cat) => cat.category_id === expenseDetail?.categoryId);
  const categoryIcon = category ? category.icon : "📝";

  return (
    <div className="mb-2">
      <div
        onClick={handleDivClick}
        className={`cursor-pointer bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-[#5BC5A7]/10 border-[#5BC5A7]" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          {showDeleteOptions && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-[#5BC5A7] rounded focus:ring-[#5BC5A7]"
              disabled={!canDelete}
            />
          )}
          <div className="bg-[#5BC5A7]/10 p-2 rounded-full">
            <span className="text-[#5BC5A7]" style={{ fontSize: "18px" }}>
              {categoryIcon}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{name}</h4>
            <p className="text-xs text-gray-600">
              {new Date(date).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-[#5BC5A7]">
            {amount.toLocaleString()} {currency}
          </span>
          {showDeleteOptions && canDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-md hover:bg-red-100 transition-colors"
              title="Xóa khoản chi"
            >
              <FiTrash2 className="text-red-500" size={16} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-50 rounded-b-lg p-4 border border-t-0 border-gray-200"
          >
            {isLoading ? (
              <p className="text-gray-600 italic animate-pulse">
                Đang tải chi tiết...
              </p>
            ) : expenseDetail ? (
              <div className="space-y-3 relative">
                {canDelete && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute top-0 right-0 p-2 bg-[#5BC5A7] text-white rounded-md hover:bg-[#4AA88C] flex items-center"
                  >
                    Sửa khoản chi
                  </button>
                )}
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Tên khoản chi
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.expenseName}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Nhóm
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.groupName}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Danh mục
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.categoryName}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Mô tả
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.description || "Không có mô tả"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Người thanh toán
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.payerUserName}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Phương thức chia
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.splitMethod === "equal"
                      ? "Chia đều"
                      : expenseDetail.splitMethod === "percentage"
                      ? "Chia theo %"
                      : "Tùy chỉnh"}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Thành viên tham gia
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {expenseDetail.participants.map((participant) => (
                      <li key={participant.participantId}>
                        {participant.userName}:{" "}
                        {participant.shareAmount.toLocaleString()} {currency}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Ngày chi
                  </h5>
                  <p className="text-sm text-gray-700">
                    {new Date(expenseDetail.expenseDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[#5BC5A7]">
                    Tổng số thành viên
                  </h5>
                  <p className="text-sm text-gray-700">
                    {expenseDetail.totalParticipants}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 italic">
                Không thể tải chi tiết khoản chi.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isEditModalOpen && expenseDetail && (
        <ModalEditExpense
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setHasFetched(false); // Đặt lại để làm mới dữ liệu sau khi chỉnh sửa
            fetchExpenseDetail();
            if (onEditSuccess) onEditSuccess();
          }}
          expenseDetail={expenseDetail}
          groupId={groupId}
          userId={userId}
          members={members}
          currency={currency}
        />
      )}
    </div>
  );
}