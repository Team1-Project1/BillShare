
"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { categories } from "@/config/categories";
import CardMemberSelect from "../card/CardMemberSelect";
import {
  FiX,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import { set } from "date-fns";

interface Member {
  id: number;
  name: string;
  avatar?: string;
}

interface Participant {
  userId: number;
  shareAmount: number;
}

interface SplitMethod {
  apiValue: string;
  displayName: string;
}

interface ModalAddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: number;
  groupId: number;
  members: Member[];
}

export default function ModalAddExpense({
  isOpen,
  onClose,
  onSuccess,
  userId,
  groupId,
  members,
}: ModalAddExpenseProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [expenseName, setExpenseName] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [expenseDate, setExpenseDate] = useState<Date | null>(new Date());
  const [description, setDescription] = useState("");
  const [payerId, setPayerId] = useState<number | "">("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>({ apiValue: "equal", displayName: "equal" });
  const [participantShares, setParticipantShares] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      // Reset toàn bộ form khi modal đóng
      setExpenseName("");
      setTotalAmount(0);
      setCategoryId(1);
      setExpenseDate(new Date());
      setDescription("");
      setPayerId("");
      setSelectedParticipants([]);
      setSplitMethod({ apiValue: "equal", displayName: "equal" });
      setParticipantShares({});
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setParticipantShares({});
  }, [selectedParticipants, splitMethod]);

  if (!isOpen) return null;

  const handleSelectParticipant = (userId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseName.trim()) {
      toast.error("Tên khoản chi không được để trống!", {
        position: "top-center",
      });
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      toast.error("Số tiền phải lớn hơn 0!", { position: "top-center" });
      return;
    }
    if (!payerId) {
      toast.error("Vui lòng chọn người chi trả!", { position: "top-center" });
      return;
    }

    let participants: Participant[] = [];

    if (selectedParticipants.length === 1) {
      participants = [{ userId: selectedParticipants[0], shareAmount: totalAmount }];
    } else if (selectedParticipants.length === 0) {
      const allMemberIds = members.map((m) => m.id);
      const share = totalAmount / allMemberIds.length;
      participants = allMemberIds.map((id) => ({ userId: id, shareAmount: share }));
    } else if (selectedParticipants.length >= 2) {
      if (splitMethod.displayName === "equal") {
        const share = totalAmount / selectedParticipants.length;
        participants = selectedParticipants.map((id) => ({
          userId: id,
          shareAmount: share,
        }));
      } else if (splitMethod.displayName === "percent") {
        let totalPercent = 0;
        participants = selectedParticipants.map((id) => {
          const percent = participantShares[id] || 0;
          totalPercent += percent;
          return { userId: id, shareAmount: (percent / 100) * totalAmount };
        });

        if (totalPercent !== 100) {
          toast.error("Tổng phần trăm phải bằng 100%", { position: "top-center" });
          return;
        }
      } else if (splitMethod.displayName === "custom") {
        let totalCustom = 0;
        participants = selectedParticipants.map((id) => {
          const amount = participantShares[id] || 0;
          totalCustom += amount;
          return { userId: id, shareAmount: amount };
        });

        if (totalCustom !== totalAmount) {
          toast.error("Tổng số tiền chia không khớp với tổng chi tiêu!", {
            position: "top-center",
          });
          return;
        }
      }
    }

    try {
      setLoading(true);
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "userId": userId.toString(),
          },
          body: JSON.stringify({
            groupId,
            expenseName,
            totalAmount,
            categoryId,
            expenseDate: expenseDate
              ? set(expenseDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString()
              : null,
            description,
            payerId,
            splitMethod: splitMethod.apiValue,
            participants,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.code === "success") {
        toast.success("Thêm khoản chi thành công!", { position: "top-center" });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Không thể thêm khoản chi!", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Lỗi khi thêm khoản chi!", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay mờ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-[500px] shadow-xl border border-gray-200 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-20">
          <h2 className="text-lg font-semibold text-gray-900">Thêm khoản chi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        {/* Nội dung scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* Expense Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khoản chi *
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all">
              <FiFileText className="text-gray-500 mr-2" />
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Nhập tên khoản chi..."
                className="w-full outline-none text-gray-800 bg-transparent"
              />
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền *
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all">
              <FiDollarSign className="text-gray-500 mr-2" />
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                placeholder="Nhập số tiền..."
                className="w-full outline-none text-gray-800 bg-transparent
                    [&::-webkit-inner-spin-button]:appearance-none 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [appearance:textfield]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.icon} {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày chi tiêu
            </label>
            <div className="relative">
              <DatePicker
                selected={expenseDate}
                onChange={(date) => setExpenseDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                className="w-full border border-gray-300 rounded-md p-2 pl-10 text-gray-800 focus:ring-1 focus:ring-[#5BC5A7]"
                placeholderText="Chọn ngày..."
              />
              <FiCalendar className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiêu..."
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 h-20 resize-none focus:ring-1 focus:ring-[#5BC5A7]"
            ></textarea>
          </div>

          {/* Payer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người chi trả *
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all">
              <FiUser className="text-gray-500 mr-2" />
              <select
                value={payerId}
                onChange={(e) => setPayerId(Number(e.target.value))}
                className="w-full text-gray-800 outline-none bg-transparent"
              >
                <option value="">-- Chọn người chi trả --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Người chia tiền
            </h3>
            <div className="space-y-2 rounded-md border border-gray-200 p-2 bg-white/70">
              {members.map((member) => (
                <CardMemberSelect
                  key={member.id}
                  avatar={member.avatar}
                  name={member.name}
                  email={""}
                  selected={selectedParticipants.includes(member.id)}
                  onSelect={() => handleSelectParticipant(member.id)}
                />
              ))}
            </div>
            {selectedParticipants.length === 0 && (
              <p className="text-xs text-gray-500 italic mt-1">
                *Chưa chọn ai, hóa đơn sẽ mặc định chia đều cho tất cả thành viên.
              </p>
            )}
          </div>

          {/* Split Method - Chỉ hiện nếu chọn >=2 người chia tiền */}
          {selectedParticipants.length >= 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cách chia tiền
              </label>
              <select
                value={splitMethod.displayName}
                onChange={(e) =>
                  setSplitMethod(
                    e.target.value === "equal"
                      ? { apiValue: "equal", displayName: "equal" }
                      : e.target.value === "percent"
                      ? { apiValue: "custom", displayName: "percent" }
                      : { apiValue: "custom", displayName: "custom" }
                  )
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
              >
                <option value="equal">Chia đều</option>
                <option value="percent">Chia theo phần trăm</option>
                <option value="custom">Tùy chỉnh</option>
              </select>

              {/* Hiển thị form chia tiền tùy chỉnh */}
              {(splitMethod.displayName === "percent" || splitMethod.displayName === "custom") && (
                <div className="mt-3 space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Nhập {splitMethod.displayName === "percent" ? "phần trăm" : "số tiền"} cho từng người:
                  </h4>
                  {selectedParticipants.map((id) => {
                    const member = members.find((m) => m.id === id);
                    if (!member) return null;
                    return (
                      <div key={id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-800">{member.name}</span>
                        <input
                          type="number"
                          value={participantShares[id] ?? ""}
                          onChange={(e) =>
                            setParticipantShares((prev) => ({
                              ...prev,
                              [id]: Number(e.target.value),
                            }))
                          }
                          placeholder={splitMethod.displayName === "percent" ? "% chia" : "Số tiền"}
                          className="w-28 border border-gray-300 rounded-md p-1 text-right text-gray-700 outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer cố định */}
        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-20">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full h-12 rounded-md text-white font-semibold transition-colors duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
            }`}
          >
            {loading ? "Đang thêm..." : "Thêm khoản chi"}
          </button>
        </div>
      </div>
    </div>
  );
}