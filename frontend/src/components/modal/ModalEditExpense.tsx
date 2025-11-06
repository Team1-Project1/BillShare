"use client";

import { useEffect, useRef, useState, useCallback } from "react"; // SỬA: Thêm useCallback
import { toast } from "react-toastify";
import { FiEdit, FiX } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import CardMemberSelect from "@/components/card/CardMemberSelect";
import { categories } from "@/config/categories";

interface Participant {
  participantId: number;
  userId: number;
  userName: string;
  userEmail: string;
  shareAmount: number;
  currency: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  // debt: number;
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

interface ModalEditExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseDetail: ExpenseDetail | null;
  groupId: number;
  userId: number;
  members: Member[];
  currency: string;
}

export default function ModalEditExpense({
  isOpen,
  onClose,
  onSuccess,
  expenseDetail,
  groupId,
  userId,
  members,
  currency,
}: ModalEditExpenseProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    expenseName: "",
    totalAmount: 0,
    categoryId: 0,
    expenseDate: "",
    description: "",
    payerId: 0,
    splitMethod: "equal" as "equal" | "custom" | "percentage",
    participants: [] as {
      userId: number;
      shareAmount: number;
      sharePercentage?: number;
    }[],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expenseDetail) {
      const prefilledParticipants = expenseDetail.participants.map((p) => ({
        userId: p.userId,
        shareAmount: p.shareAmount,
        sharePercentage:
          expenseDetail.splitMethod === "percentage"
            ? Math.round(
                (p.shareAmount / expenseDetail.totalAmount) * 100 * 100
              ) / 100
            : undefined,
      }));
      setFormData({
        expenseName: expenseDetail.expenseName,
        totalAmount: expenseDetail.totalAmount,
        categoryId: expenseDetail.categoryId,
        expenseDate: new Date(expenseDetail.expenseDate)
          .toISOString()
          .slice(0, 16),
        description: expenseDetail.description || "",
        payerId: expenseDetail.payerUserId,
        splitMethod: expenseDetail.splitMethod as
          | "equal"
          | "custom"
          | "percentage",
        participants: prefilledParticipants,
      });
    }
  }, [expenseDetail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const updateFormData = useCallback((updates: Partial<typeof formData>) => { // SỬA: Gói bằng useCallback
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const isCustom = formData.splitMethod === "custom";
  const isPercentage = formData.splitMethod === "percentage";

  const recalculateShares = useCallback(() => { // SỬA: Gói bằng useCallback
    if (formData.participants.length === 0) return;

    let newParticipants = [...formData.participants];

    if (formData.splitMethod === "equal") {
      const participantCount = formData.participants.length;
      const floorShare = Math.floor(formData.totalAmount / participantCount);
      const remainder = formData.totalAmount - floorShare * participantCount;
      newParticipants = newParticipants.map((p, index) => ({
        ...p,
        shareAmount: floorShare + (index < remainder ? 1 : 0),
        sharePercentage: undefined,
      }));
    } else if (formData.splitMethod === "percentage") {
      const totalPercentage = newParticipants.reduce(
        (sum, p) => sum + (p.sharePercentage || 0),
        0
      );
      if (totalPercentage === 0) {
        newParticipants = newParticipants.map((p) => ({
          ...p,
          shareAmount: 0,
          sharePercentage: 0,
        }));
      } else {
        // Tính shareAmount cơ bản
        newParticipants = newParticipants.map((p) => ({
          ...p,
          shareAmount: (p.sharePercentage! / 100) * formData.totalAmount,
        }));
        // Làm tròn và phân phối phần dư
        const floorShares = newParticipants.map((p) =>
          Math.floor(p.shareAmount)
        );
        const currentTotal = floorShares.reduce(
          (sum, amount) => sum + amount,
          0
        );
        const remainder = Math.round(formData.totalAmount) - currentTotal;
        newParticipants = newParticipants.map((p, index) => ({
          ...p,
          shareAmount: floorShares[index] + (index < remainder ? 1 : 0),
        }));
      }
    }

    updateFormData({ participants: newParticipants });
  }, [formData.totalAmount, formData.participants, formData.splitMethod, updateFormData]); // SỬA: Thêm dependencies

  useEffect(() => {
    recalculateShares();
  }, [recalculateShares]); // SỬA: Thêm dependency

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const updates: Partial<typeof formData> = { [name]: value };
    if (name === "totalAmount") {
      updates.totalAmount = Number(value);
    } else if (name === "categoryId" || name === "payerId") {
      updates[name] = Number(value);
    } else if (name === "splitMethod") {
      updates.splitMethod = value as "equal" | "custom" | "percentage";
      updates.participants = formData.participants.map((p) => ({
        ...p,
        sharePercentage: updates.splitMethod === "percentage" ? 0 : undefined,
      }));
    }
    updateFormData(updates);
  };

  const handleSplitMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as "equal" | "custom" | "percentage";
    updateFormData({
      splitMethod: value,
      participants: formData.participants.map((p) => ({
        ...p,
        sharePercentage: value === "percentage" ? 0 : undefined,
      })),
    });
  };

  const handleParticipantToggle = (userId: number) => {
    let newParticipants = [...formData.participants];
    if (newParticipants.find((p) => p.userId === userId)) {
      newParticipants = newParticipants.filter((p) => p.userId !== userId);
    } else {
      newParticipants.push({
        userId,
        shareAmount: 0,
        sharePercentage: formData.splitMethod === "percentage" ? 0 : undefined,
      });
    }
    updateFormData({ participants: newParticipants });
  };

  const handleParticipantChange = (
    userId: number,
    value: number,
    field: "amount" | "percentage"
  ) => {
    const newParticipants = formData.participants.map((p) =>
      p.userId === userId
        ? {
            ...p,
            [field === "amount" ? "shareAmount" : "sharePercentage"]: value,
            ...(field === "percentage" && {
              shareAmount: (value / 100) * formData.totalAmount,
            }),
          }
        : p
    );
    updateFormData({ participants: newParticipants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseDetail) return;

    setIsLoading(true);

    try {
      const payload = {
        expenseName: formData.expenseName,
        totalAmount: Number(formData.totalAmount),
        categoryId: Number(formData.categoryId),
        expenseDate: formData.expenseDate,
        description: formData.description || null, // ← Quan trọng: null nếu rỗng
        payerId: Number(formData.payerId),
        splitMethod: formData.splitMethod,
        participants: formData.participants.map(p => ({
          userId: p.userId,
          shareAmount: Math.round(p.shareAmount),
        })),
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseDetail.expenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            userId: userId.toString(),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Cập nhật thất bại");
      }

      toast.success("Cập nhật thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !expenseDetail) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-lg">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[500px] shadow-xl border border-gray-200 overflow-y-auto max-h-[80vh]"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">
            Cập nhật khoản chi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Tên khoản chi
            </label>
            <input
              type="text"
              name="expenseName"
              value={formData.expenseName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Tổng số tiền
            </label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Danh mục
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.icon} {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Ngày chi
            </label>
            <input
              type="datetime-local"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Người thanh toán
            </label>
            <select
              name="payerId"
              value={formData.payerId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Phương thức chia
            </label>
            <select
              name="splitMethod"
              value={formData.splitMethod}
              onChange={handleSplitMethodChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
              required
            >
              <option value="equal">Chia đều</option>
              <option value="custom">Tùy chỉnh</option>
              <option value="percentage">Chia theo %</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5BC5A7]">
              Thành viên tham gia
            </label>
            <div className="space-y-2">
              {members.map((member) => {
                const isSelected = formData.participants.some(
                  (p) => p.userId === member.id
                );
                const participant = formData.participants.find(
                  (p) => p.userId === member.id
                );
                return (
                  <div key={member.id} className="flex flex-col space-y-1">
                    <CardMemberSelect
                      avatar={member.avatar}
                      name={member.name}
                      email={member.email}
                      selected={isSelected}
                      onSelect={() => handleParticipantToggle(member.id)}
                    />
                    {isSelected && isCustom && (
                      <div className="ml-14 flex items-center gap-2">
                        <label className="text-sm text-gray-600">
                          Số tiền:
                        </label>
                        <input
                          type="number"
                          value={participant?.shareAmount || 0}
                          onChange={(e) =>
                            handleParticipantChange(
                              member.id,
                              Number(e.target.value),
                              "amount"
                            )
                          }
                          className="w-24 p-1 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
                          placeholder="Số tiền"
                          required
                        />
                      </div>
                    )}
                    {isSelected && isPercentage && (
                      <div className="ml-14 flex items-center gap-2">
                        <label className="text-sm text-gray-600">
                          Phần trăm:
                        </label>
                        <input
                          type="number"
                          value={participant?.sharePercentage || 0}
                          onChange={(e) =>
                            handleParticipantChange(
                              member.id,
                              Number(e.target.value),
                              "percentage"
                            )
                          }
                          className="w-16 p-1 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]"
                          placeholder="%"
                          required
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-700">
                          ({participant?.shareAmount.toLocaleString() || 0}{" "}
                          {currency})
                        </span>
                      </div>
                    )}
                    {isSelected && !isCustom && !isPercentage && (
                      <div className="ml-14 text-sm text-gray-700">
                        {participant?.shareAmount.toLocaleString() || 0}{" "}
                        {currency}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiEdit className="mr-2" />{" "}
            {isLoading ? "Đang cập nhật..." : "Cập nhật khoản chi"}
          </button>
        </form>
      </div>
    </div>
  );
}