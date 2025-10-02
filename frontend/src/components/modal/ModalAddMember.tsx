"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FiUsers, FiMail, FiSearch, FiUser, FiSend } from "react-icons/fi";
import CardMemberSelect from "../card/CardMemberSelect";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ModalAddMemberProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  createdBy: number;
  onInviteSuccess: () => void;
}

export default function ModalAddMember({
  isOpen,
  onClose,
  groupId,
  createdBy,
  onInviteSuccess,
}: ModalAddMemberProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Dữ liệu thành viên mẫu (tái sử dụng CardMemberSelect)
  const members = [
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", avatar: "/avatar1.png" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com", avatar: "/avatar2.png" },
    { id: 3, name: "Lê Văn C", email: "c@gmail.com", avatar: "/avatar3.png" },
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

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (inviteOpen) setInviteOpen(false); // Đóng invite nếu đang mở
  };

  const handleInviteToggle = () => {
    setInviteOpen(!inviteOpen);
    if (searchOpen) setSearchOpen(false); // Đóng search nếu đang mở
  };

  const handleSendInvite = async () => {
    const currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);
    if (currentUserId !== createdBy) {
      toast.error("Chỉ người tạo nhóm mới có quyền mời!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/email/confirm-participation?groupId=${groupId}&userId=${createdBy}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({ emailTo: email }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          return;
        }
        throw new Error("Không thể gửi lời mời");
      }

      const data = await response.text();
      toast.success(data, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setEmail(""); // Reset input
      setInviteOpen(false); // Đóng thanh email
      onInviteSuccess(); // Reload danh sách thành viên
    } catch (err) {
      console.error("Invite error:", err);
      toast.error("Không thể gửi lời mời!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleAddMembers = () => {
    console.log(
      "Thêm thành viên:",
      selectedMembers.map((id) => members.find((m) => m.id === id)?.name)
    );
    onClose();
  };

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
          <h2 className="text-lg font-semibold text-gray-900">Thêm thành viên</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <button
          onClick={handleSearchToggle}
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4"
        >
          <FiUser className="mr-2" /> Thêm bằng tên người dùng
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tên người dùng..."
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:border-[#5BC5A7]"
            style={{ display: searchOpen ? "block" : "none" }}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleInviteToggle}
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4"
        >
          <FiMail className="mr-2" /> Mời qua email
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            inviteOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex items-center mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              className="flex-1 border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
              style={{ display: inviteOpen ? "block" : "none" }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendInvite}
              disabled={isLoading}
              className={`ml-2 bg-[#5BC5A7] text-white rounded-md p-2 hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <FiUsers className="text-[#5BC5A7] mr-2" />
          <p className="text-[16px] text-gray-700">Thêm bạn bè vào nhóm</p>
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
        <button
          onClick={handleAddMembers}
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4"
        >
          Thêm thành viên
        </button>
      </div>
    </div>
  );
}