"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FiUsers, FiTrash2 } from "react-icons/fi";
import CardMemberSelect from "../card/CardMemberSelect";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface ModalViewAllMembersProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteMemberSuccess: () => void;
  groupId: number;
  members: Member[];
  createdBy: number;
}

export default function ModalViewAllMembers({ isOpen, onClose, onDeleteMemberSuccess, groupId, members, createdBy}: ModalViewAllMembersProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

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

  const userId = Number(localStorage.getItem("userId"));
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

  const handleSelectMember = (id: number) => {
    if (id === userId) {
      toast.warn("Bạn không thể chọn chính mình để xóa!", { position: "top-center" });
      return;
    }

    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

const handleDeleteMembers = async () => {
  try {
    const results = await Promise.all(
      selectedMembers.map(async (memberId) => {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}/delete/${memberId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.status === 500) {
            throw new Error("Thành viên có giao dịch chưa thanh toán");
          } else {
            throw new Error(errorData.message || "Không thể xóa thành viên");
          }
        }
        return response;
      })
    );

    toast.success("Xóa thành viên thành công!", { position: "top-center" });
    setSelectedMembers([]);
    onDeleteMemberSuccess();
    onClose();

  } catch (err: any) {
    toast.error(err.message || "Lỗi khi xóa thành viên!", { position: "top-center" });
  } finally {
    setSelectedMembers([]);
  }
};

  const canShowDelete = userId === createdBy; // Chỉ người tạo nhóm mới có quyền xóa thành viên

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
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
          <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Tất cả thành viên</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mb-4 flex items-center">
          <FiUsers className="text-[#5BC5A7] mr-2" />
          <p className="text-[16px] text-gray-700">Danh sách thành viên</p>
        </div>
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
        {canShowDelete &&(
          <button
          onClick={handleDeleteMembers}
          disabled={selectedMembers.length === 0}
          className={`w-full h-12 bg-red-500 text-white rounded-md text-base font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4 ${selectedMembers.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FiTrash2 className="mr-2" /> Xóa
          </button>
        )}
        
      </div>
    </div>
  );
}