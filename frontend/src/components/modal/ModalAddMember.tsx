"use client";

import { useState, useRef, useEffect } from "react";
import { FiUsers, FiMail, FiSearch, FiUser } from "react-icons/fi";
import CardMemberSelect from "../card/CardMemberSelect";

export default function ModalAddMember({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Dữ liệu thành viên mẫu (tái sử dụng CardMemberSelect)
  const members = [
    { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", avatar: "/avatar1.png" },
    { id: 2, name: "Trần Thị B", email: "b@gmail.com", avatar: "/avatar2.png" },
    { id: 3, name: "Lê Văn C", email: "c@gmail.com", avatar: "/avatar3.png" },
  ];
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

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  const handleInviteEmail = () => {
    alert("Gửi lời mời qua email"); // Logic mời email bạn làm sau
  };

  const handleSelectMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleAddMembers = () => {
    console.log("Thêm thành viên:", selectedMembers.map(id => members.find(m => m.id === id)?.name));
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tên người dùng..."
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:border-[#5BC5A7] flex items-center"
            style={{ display: searchOpen ? "block" : "none" }}
          />
        </div>
        <button
          onClick={handleInviteEmail}
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4"
        >
          <FiMail className="mr-2" /> Mời qua email
        </button>
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

        {/* Code thêm nút xóa nhóm ở đây */}
      
      </div>
    </div>
  );
}