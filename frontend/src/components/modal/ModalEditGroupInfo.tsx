"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { currencies } from "@/config/currencies";

interface Group {
  groupId: number;
  name: string;
  description: string;
  defaultCurrency: string;
}

interface ModalEditGroupInfoProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdateSuccess: () => void;
}

export default function ModalEditGroupInfo({ isOpen, onClose, group, onUpdateSuccess }: ModalEditGroupInfoProps) {
  const [groupName, setGroupName] = useState<string>(group.name);
  const [description, setDescription] = useState<string>(group.description);
  const [defaultCurrency, setDefaultCurrency] = useState<string>(group.defaultCurrency);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Khởi tạo giá trị ban đầu từ group
    setGroupName(group.name);
    setDescription(group.description);
    setDefaultCurrency(group.defaultCurrency);
  }, [group]);

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

  const handleEdit = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/group/edit/${group.groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({
          groupName,
          description: description, 
          defaultCurrency: defaultCurrency || "VND",
        }),
      });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi API:", errorData); // Ghi log lỗi chi tiết
      if (response.status === 401 || response.status === 403) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        return;
      }
      if (response.status === 409) {
        toast.error(errorData.message || "Xung đột dữ liệu khi cập nhật nhóm!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        return;
      }
      throw new Error("Không thể cập nhật thông tin nhóm");
    }

    const data = await response.json();
    if (data.code === "error") {
      toast.error(data.message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    if (data.code === "success") {
      toast.success("Cập nhật thông tin nhóm thành công!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      onUpdateSuccess();
      onClose();
    }
  } catch (err) {
    console.error("Lỗi:", err); // Ghi log lỗi
    toast.error("Không thể cập nhật thông tin nhóm!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-[#5BC5A7]">Chỉnh sửa thông tin nhóm</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm *</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiền tệ</label>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleEdit}
          className="w-full h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
