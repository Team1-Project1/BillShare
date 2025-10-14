"use client";

import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { categories } from "@/config/categories";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  // debt: number;
}

interface SearchBarProps {
  groupId: number;
  members: Member[];
  isSearchOpen?: boolean; // Thêm prop để kiểm soát trạng thái mở
}

export const SearchBar = ({ groupId, members, isSearchOpen = false }: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(isSearchOpen); // Sử dụng prop isSearchOpen làm giá trị ban đầu
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [expenseName, setExpenseName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const router = useRouter();

  // Kiểm tra userId có trong nhóm
  const userId = Number(localStorage.getItem("userId"));
  useEffect(() => {
    if (!userId || !members.some((member) => member.id === userId)) {
      toast.error("Bạn không phải là thành viên của nhóm này!", {
        position: "top-center",
        autoClose: 2000,
      });
      setIsOpen(false);
    }
  }, [userId, members]);

  const handleSearch = async () => {
    if (!userId || !members.some((member) => member.id === userId)) {
      toast.error("Bạn không có quyền tìm kiếm trong nhóm này!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Chuẩn bị tham số tìm kiếm
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append("categoryId", categoryId.toString());
    if (expenseName) queryParams.append("expenseName", expenseName);
    if (startDate)
      queryParams.append(
        "expenseDateFrom",
        startDate.toISOString().split("T")[0]
      );
    if (endDate)
      queryParams.append("expenseDateTo", endDate.toISOString().split("T")[0]);

    // Chuyển hướng đến trang kết quả tìm kiếm
    router.push(`/group/detail/${groupId}/search?${queryParams.toString()}`);
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[#5BC5A7] text-white rounded-full flex items-center justify-center hover:bg-[#4AA88C] transition-colors duration-300"
      >
        <FiSearch size={20} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-3"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.icon} {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tên khoản chi
              </label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Nhập tên khoản chi..."
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
              />
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Từ ngày
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày bắt đầu"
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Đến ngày
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày kết thúc"
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center"
            >
              Tìm kiếm
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}