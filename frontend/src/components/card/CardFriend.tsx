// src/components/card/CardFriend.tsx
import { FiUser, FiX } from "react-icons/fi";

interface CardFriendProps {
  name: string;
  email: string;
  onUnfriend: () => void;
}

export default function CardFriend({ name, email, onUnfriend }: CardFriendProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 flex items-center justify-between hover:shadow-lg transition-shadow duration-300">
      {/* Thông tin bạn bè */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-12 h-12 bg-[#5BC5A7]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <FiUser className="text-[#5BC5A7] text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-sm text-gray-600 truncate">{email}</p>
        </div>
      </div>

      <button
        onClick={onUnfriend}
        className={`
          group flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          text-red-500 font-medium text-sm
          bg-red-50/70 hover:bg-red-100
          border border-red-200 hover:border-red-300
          transition-all duration-200 ease-out
          active:scale-95
        `}
        title="Hủy kết bạn"
      >
        <span className="hidden sm:inline">Hủy kết bạn</span>
        <FiX
          size={16}
          className="text-red-500 group-hover:text-red-600 transition-colors"
        />
      </button>
    </div>
  );
}