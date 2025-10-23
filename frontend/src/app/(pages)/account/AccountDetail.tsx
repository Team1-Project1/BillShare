"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalConfirmLogout from "@/components/modal/ModalConfirmLogout";
import { FiUser, FiMail, FiSettings, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";
import ModalUserInfo from "@/components/modal/ModalUserInfo";
import ModalResetPassword from "@/components/modal/ModalResetPassword";

interface User {
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
}

export default function AccountDetailPage() {
  const { userId } = useAuthRefresh();
  const [isModalUserInfoOpen, setIsModalUserInfoOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [onSuccess, setOnSuccess] = useState(false);
  const [isAccountSettingOpen, setIsAccountSettingOpen] = useState(false);
  const [isModalResetPasswordOpen, setIsModalResetPasswordOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  useEffect(() => {
    if (onSuccess) {
        fetchUserData();
        setOnSuccess(false);
    }
  }, [onSuccess]);

  const fetchUserData = async () => {
    console.log(userId)
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/users `,
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
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
                position: "top-center",
            });
            return;
        } else if (response.status === 500) {
          toast.error ("Bạn không có quyền truy cập", {
              position: "top-center",
          });
        }
        throw new Error("Không thể tải thông tin");
      }
      
      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message, { position: "top-center" });
        return;
      }
      
      if (data.code === "success") {
        setUser(data.data);
        toast.success("Tải thông tin thành công!", {
          position: "top-center",
        });
      }
    } catch (error) {
        toast.error("Không thể tải thông tin!", { position: "top-center" });
    }
  };

  useEffect(() => {
    if (userId) {
        fetchUserData();
    }
  }, [userId]);
      

  return (
    <>
      {/* Thông tin người dùng */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-6 mt-6 text-gray-800">
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#5BC5A7] shadow-md mb-3">
            <img
              src={user?.avatarUrl}
              alt="Avatar người dùng"
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#5BC5A7]">{user?.fullName}</h1>
        </div>

        {/* Danh sách tùy chọn */}
        <div className="space-y-3">
          <button
            onClick={() => setIsModalUserInfoOpen(true)} 
            className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <FiUser className="text-[#5BC5A7] mr-3" size={20} />
            <span className="text-base font-medium">Thông tin cá nhân</span>
          </button>

          <button className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition">
            <FiMail className="text-[#5BC5A7] mr-3" size={20} />
            <span className="text-base font-medium">Liên hệ hỗ trợ</span>
          </button>

          {/* Cài đặt tài khoản (menu cha) */}
          <div>
          <button
            onClick={() => setIsAccountSettingOpen(!isAccountSettingOpen)}
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center">
              <FiSettings className="text-[#5BC5A7] mr-3" size={20} />
              <span className="text-base font-medium">Cài đặt tài khoản</span>
            </div>
            <span
              className={`transition-transform duration-200 ${
              isAccountSettingOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>

          {/* Menu con */}
          {isAccountSettingOpen && (
            <div className="pl-10 pr-3 py-2 animate-fadeIn ">
              <button
                onClick={() => setIsModalResetPasswordOpen(true)}
                className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 text-gray-700 transition"
              >
                <FiLock className="text-[#5BC5A7] mr-3" size={18} />
                <span className="text-sm font-medium">Đặt lại mật khẩu</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="w-full max-w-[200px] h-12 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center mx-auto mt-4" > 
        Đăng xuất 
      </button> 
        <ModalConfirmLogout 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleLogout} 
        />
        <ModalUserInfo
        isOpen={isModalUserInfoOpen}
        onClose={() => setIsModalUserInfoOpen(false)}
        onSuccess={() => setOnSuccess(true)}
        user={user!}
        userId={userId!}
        />
        <ModalResetPassword
        isOpen= {isModalResetPasswordOpen}
        onClose={() => setIsModalResetPasswordOpen(false)}
        onSuccess={handleLogout}
        user={user!}
        userId={userId!}
        />
    </>
  );
}
