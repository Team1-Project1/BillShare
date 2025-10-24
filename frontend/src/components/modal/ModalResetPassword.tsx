"use client";

import { useState, useEffect, useRef } from "react";
import { FiLock, FiSave, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

interface User {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

interface ResetPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

export default function ResetPassword({
  isOpen,
  onClose,
  onSuccess,
  user,
}: ResetPasswordProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [isOpen]);

  if (!user || !isOpen) return null;

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!", { position: "top-center" });
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!",
        { position: "top-center" }
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không trùng khớp!", { position: "top-center" });
      return;
    }

    try {
      setIsLoading(true);

      const userData = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        oldPassword: currentPassword,
        newPassword: newPassword,
        repeatNewPassword: confirmPassword,
      };
      const userJson = JSON.stringify(userData);

      const formData = new FormData();
      formData.append("user", userJson);

      let accessToken = localStorage.getItem("accessToken");
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/edit`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            Accept: "*/*",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "refresh-token": refreshToken ?? "",
            },
          }
        );

        if (refreshRes.ok) {
          const tokenData = await refreshRes.json();
          const newAccessToken = tokenData.accessToken;
          const newRefreshToken = tokenData.refreshToken;

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            accessToken = newAccessToken;
            response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/users/edit`,
              {
                method: "PATCH",
                body: formData,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "*/*",
                },
              }
            );
          } else {
            localStorage.clear();
            window.location.href = "/login";
            return;
          }
        } else {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
      }

      const data = await response.json();

      if (response.status === 500) {
        toast.error("Mật khẩu cũ sai. Vui lòng nhập lại!", { position: "top-center" });
        return;
      }

      if (!response.ok || data.code === "error") {
        toast.error(data.message || "Không thể đổi mật khẩu!", {
          position: "top-center",
        });
        return;
      }

      toast.success("Đổi mật khẩu thành công!", { position: "top-center" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Lỗi khi đổi mật khẩu!", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[500px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <h2 className="text-center text-xl font-semibold text-[#5BC5A7] mb-6">
          Đổi mật khẩu
        </h2>

        <div className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiLock className="text-[#5BC5A7] mr-2" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiLock className="text-[#5BC5A7] mr-2" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Nhập lại mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu mới
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiLock className="text-[#5BC5A7] mr-2" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleChangePassword}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 w-[200px] h-12 rounded-md text-base font-semibold transition-all duration-300 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed text-gray-800"
                : "bg-[#5BC5A7] text-white hover:bg-[#4AA88C]"
            }`}
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <FiSave size={18} />
                <span>Đổi mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
