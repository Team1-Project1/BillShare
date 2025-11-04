import { FiUser, FiX } from "react-icons/fi";
import Image from "next/image";

interface CardFriendProps {
  name: string;
  email: string;
  avatarUrl: string;
  onUnfriend: () => void;
  showUnfriend?: boolean; // Mới thêm
}

export default function CardFriend({
  name,
  email,
  avatarUrl,
  onUnfriend,
  showUnfriend = true, // Mặc định hiển thị
}: CardFriendProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 flex items-center justify-between hover:shadow-lg transition-shadow duration-300">
      {/* Thông tin bạn bè */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
          ) : (
            <FiUser className="text-[#5BC5A7] text-xl" />
          )}

        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-sm text-gray-600 truncate">{email}</p>
        </div>
      </div>

      {/* Nút Hủy kết bạn – chỉ hiện nếu showUnfriend = true */}
      {showUnfriend && (
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
      )}
    </div>
  );
}