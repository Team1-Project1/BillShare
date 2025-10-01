"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import CardMemberSelect from "../card/CardMemberSelect";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function ModalCreateGroup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [avatar, setAvatar] = useState("/placeholder-avatar.png"); // Avatar mặc định
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Dữ liệu thành viên mẫu
  const members = [
    { id: 1, name: "An", email: "annghiav01@gmail.com", avatar: "/avatar1.png" },
    { id: 2, name: "Trung Pham", email: "trung@gmail.com", avatar: "/avatar2.png" },
  ];

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

  const handleSelectMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleUploadAvatar = () => {
    alert("Upload avatar to Cloudinary"); // Logic upload bạn làm sau
  };

  const handleCreate = async () => {
    try {
      const userId = localStorage.getItem("userId"); // Giả định userId lưu trong localStorage
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

      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/group/create/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({
          groupName,
          description: groupDesc || "Không có mô tả", // Giá trị mặc định nếu không nhập
          defaultCurrency: "VND", // Giá trị mặc định
        }),
      });

      if (!response.ok) {
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
        throw new Error("Không thể tạo nhóm");
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
        toast.success("Tạo nhóm thành công!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        console.log("Thành viên được chọn:", selectedMembers.map(id => members.find(m => m.id === id)?.name));
        onClose();
      }
    } catch (err) {
      toast.error("Không thể tạo nhóm!", {
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tạo Nhóm</h2>
          <button
            onClick={handleCreate}
            className="w-24 h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center"
          >
            Tạo
          </button>
        </div>
        <h3 className="text-base font-medium text-gray-700 mb-2">Thông tin nhóm</h3>
        <div className="mb-4 text-center">
          <img
            src={avatar}
            alt="Avatar nhóm"
            className="w-24 h-24 rounded-full mx-auto cursor-pointer"
            onClick={handleUploadAvatar}
          />
          <p className="text-sm text-gray-500 mt-2">Nhấn để tải ảnh lên</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin mô tả</label>
          <textarea
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24"
          />
        </div>
        <h3 className="text-base font-medium text-gray-700 mb-2">Thêm thành viên</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {members.map((member) => (
            <CardMemberSelect
              key={member.id}
              avatar={member.avatar}
              name={member.name}
              email={member.email}
              selected={selectedMembers.includes(member.id)}
              onSelect={() => handleSelectMember(member.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}