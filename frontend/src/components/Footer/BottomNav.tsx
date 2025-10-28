import Link from "next/link";
import { FiHome, FiUsers, FiUser, FiSettings, FiActivity } from "react-icons/fi";

export const BottomNav = () => {
  return (
    <div className="fixed bottom-0 w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 shadow-md mt-6">
      <div className="flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300">
          <FiActivity size={20} />
          <span className="text-xs">Activities</span>
        </Link>
        <Link href="/group/list" className="flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300">
          <FiUsers size={20} />
          <span className="text-xs">Groups</span>
        </Link>
        <Link href="/friends" className="flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300">
          <FiUser size={20} />
          <span className="text-xs">Friends</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300">
          <FiSettings size={20} />
          <span className="text-xs">Account</span>
        </Link>
      </div>
    </div>
  );
};