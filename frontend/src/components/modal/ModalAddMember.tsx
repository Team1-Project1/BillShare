"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FiUsers, FiMail, FiSearch, FiUser, FiSend, FiX, FiUserPlus, FiChevronDown } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Friend {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
}

interface PageableResponse {
  content: Friend[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface MemberInGroup {
  id: number;
}

interface ModalAddMemberProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  createdBy: number;
  onInviteSuccess: () => void;
  currentMembers: MemberInGroup[]; // Danh sách thành viên hiện tại trong nhóm
}

// CardFriendSelect chỉ dùng trong modal này
const CardFriendSelect = ({
  name,
  email,
  selected,
  onSelect,
}: {
  name: string;
  email: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl p-4 shadow-md border ${
        selected ? "border-[#5BC5A7]" : "border-gray-200"
      } flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-12 h-12 bg-[#5BC5A7]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <FiUser className="text-[#5BC5A7] text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-sm text-gray-600 truncate">{email}</p>
        </div>
      </div>
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "bg-[#5BC5A7] border-[#5BC5A7]" : "border-gray-300"
        }`}
      >
        {selected && <div className="w-3 h-3 bg-white rounded-full" />}
      </div>
    </div>
  );
};

export default function ModalAddMember({
  isOpen,
  onClose,
  groupId,
  createdBy,
  onInviteSuccess,
  currentMembers = [], // Mặc định rỗng nếu không truyền
}: ModalAddMemberProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);

  // Lấy ID thành viên hiện tại trong nhóm
  const currentMemberIds = currentMembers.map((m) => m.id);

  // Fetch danh sách bạn bè (dùng đúng API trong FriendsPage)
  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/users/friends?page=0&size=100`,
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
          toast.error("Phiên đăng nhập hết hạn!", { position: "top-center" });
          return;
        }
        throw new Error("Không thể tải danh sách bạn bè");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message || "Lỗi tải bạn bè", { position: "top-center" });
        return;
      }

      if (data.code === "success") {
        const pageableData: PageableResponse = data.data;
        const newFriends = pageableData.content || [];

        // Loại bỏ người đã trong nhóm
        const filtered = newFriends.filter((f) => !currentMemberIds.includes(f.id));

        setFriends(filtered);
      }
    } catch (err) {
      console.error("Fetch friends error:", err);
      toast.error("Không thể tải danh sách bạn bè!", { position: "top-center" });
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setSelectedMembers([]);
      setSearchQuery("");
      setEmail("");
      setInviteOpen(false);
      setSearchOpen(false);
    }
  }, [isOpen, currentMembers]);

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
    if (searchOpen) setSearchOpen(false);
  };

  const handleSendInvite = async () => {
    if (currentUserId !== createdBy) {
      toast.error("Chỉ người tạo nhóm mới có quyền mời!", { position: "top-center" });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ!", { position: "top-center" });
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

      if (!response.ok) throw new Error("Không thể gửi lời mời");

      const data = await response.text();
      toast.success(data, { position: "top-center" });
      setEmail("");
      setInviteOpen(false);
      onInviteSuccess();
    } catch (err) {
      toast.error("Không thể gửi lời mời!", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một người bạn!", { position: "top-center" });
      return;
    }

    setIsLoading(true);
    try {
      const addPromises = selectedMembers.map(async (userId) => {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/group-member/${groupId}/add-friend/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `Không thể thêm ${userId}`);
        }
        return response.json();
      });

      await Promise.all(addPromises);

      toast.success(`Đã thêm ${selectedMembers.length} thành viên vào nhóm!`, {
        position: "top-center",
      });
      onInviteSuccess();
      onClose();
    } catch (err: any) {
      console.error("Add friends error:", err);
      toast.error(err.message || "Có lỗi khi thêm thành viên!", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc bạn bè theo search
  const filteredFriends = friends.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md hover:border-[#5BC5A7] transition-colors"
          >
            <span className="flex items-center text-gray-600">
              <FiSearch className="mr-2" /> Tìm kiếm bạn bè...
            </span>
            <FiChevronDown className={`transition-transform ${searchOpen ? "rotate-180" : ""}`} />
          </button>
          {searchOpen && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên hoặc email..."
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:border-[#5BC5A7] focus:outline-none"
              autoFocus
            />
          )}
        </div>

        {/* Mời qua email */}
        <button
          onClick={handleInviteToggle}
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4"
        >
          <FiMail className="mr-2" /> Mời qua email
        </button>
        {inviteOpen && (
          <div className="flex items-center mb-4 animate-in slide-in-from-top duration-300">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              className="flex-1 border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] focus:outline-none"
            />
            <button
              onClick={handleSendInvite}
              disabled={isLoading}
              className={`ml-2 bg-[#5BC5A7] text-white rounded-md p-2 hover:bg-[#4AA88C] transition-colors flex items-center justify-center ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        )}

        {/* Danh sách bạn bè */}
        <div className="mb-4 flex items-center">
          <FiUsers className="text-[#5BC5A7] mr-2" />
          <p className="text-[16px] text-gray-700">
            Thêm bạn bè vào nhóm ({selectedMembers.length} đã chọn)
          </p>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto">
          {friendsLoading ? (
            <p className="text-center text-gray-500 italic py-4">Đang tải bạn bè...</p>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <CardFriendSelect
                key={friend.id}
                name={friend.fullName}
                email={friend.email}
                selected={selectedMembers.includes(friend.id)}
                onSelect={() => handleSelectMember(friend.id)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 italic py-4">
              {searchQuery
                ? "Không tìm thấy bạn bè nào."
                : friends.length === 0
                ? "Bạn chưa có bạn bè hoặc tất cả bạn bè đã trong nhóm."
                : "Tất cả bạn bè đã trong nhóm."}
            </p>
          )}
        </div>

        {/* Nút thêm thành viên */}
        <button
          onClick={handleAddMembers}
          disabled={isLoading || selectedMembers.length === 0}
          className={`w-full h-12 mt-4 rounded-md text-base font-semibold transition-colors flex items-center justify-center ${
            selectedMembers.length === 0 || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#5BC5A7] text-white hover:bg-[#4AA88C]"
          }`}
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Đang thêm...
            </>
          ) : (
            <>
              <FiUserPlus className="mr-2" /> Thêm {selectedMembers.length} thành viên
            </>
          )}
        </button>
      </div>
    </div>
  );
}