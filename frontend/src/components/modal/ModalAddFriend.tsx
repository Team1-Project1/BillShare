"use client";

import { useState, useRef, useEffect } from "react";
import { FiMail, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ModalAddFriendProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAddFriend({ isOpen, onClose, onSuccess }: ModalAddFriendProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleInviteToggle = () => {
    setInviteOpen(!inviteOpen);
  };

  const handleSendInvite = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/users/send-friend-request?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Không thể gửi lời mời");

      const data = await response.json();
      toast.success("Đã gửi lời mời kết bạn!");
      setEmail("");
      setInviteOpen(false);
      onSuccess();
    } catch (err) {
      toast.error("Lỗi khi gửi lời mời");
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-lg font-semibold text-gray-900">Thêm bạn bè</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            X
          </button>
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
      </div>
    </div>
  );
}