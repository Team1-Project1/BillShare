"use client";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiMail, FiPhone, FiEdit3, FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
// Import đúng type mới
import type { FilePondFile, FilePondInitialFile } from "filepond";
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);
interface User {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}
interface UserInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}
export default function UserInfo({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  // CHỈ DÙNG FilePondInitialFile CHO files prop
  const [initialFiles, setInitialFiles] = useState<FilePondInitialFile[]>(
    user?.avatarUrl
      ? [{ source: user.avatarUrl, options: { type: "local" } }]
      : []
  );
  // DÙNG FilePondFile CHO file người dùng chọn
  const [fileItems, setFileItems] = useState<FilePondFile[]>([]);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // Đồng bộ khi user hoặc isOpen thay đổi
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setInitialFiles(
      user.avatarUrl
        ? [{ source: user.avatarUrl, options: { type : "local"} }]
        : []
    );
    setFileItems([]);
    setIsEditing(false);
    setIsEmailChanged(false);
  }, [user, isOpen]);
  // Click outside để đóng
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
  const handleSetEditing = async () => {
    if (isEditing) {
      const success = await handleSaveChanges();
      if (success) setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  const handleSaveChanges = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (!fullName.trim()) {
        toast.error("Vui lòng nhập tên người dùng!", { position: "top-center", autoClose: 3000 });
        return false;
      }
      if (!email.trim()) {
        toast.error("Vui lòng nhập email!", { position: "top-center", autoClose: 3000 });
        return false;
      }
      if (!phone.trim()) {
        toast.error("Vui lòng nhập số điện thoại!", { position: "top-center", autoClose: 3000 });
        return false;
      }
      if (email !== user.email) {
        setIsEmailChanged(true);
      }
      const userData = { fullName, email, phone };
      const formData = new FormData();
      formData.append("user", JSON.stringify(userData));
      // Upload file mới
      if (fileItems.length > 0 && fileItems[0].file instanceof File) {
        formData.append("file", fileItems[0].file);
      }
      let accessToken = localStorage.getItem("accessToken");
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/edit`, {
        method: "PATCH",
        body: formData,
        headers: {
          // "Content-Type": "multipart/form-data",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          Accept: "*/*",
        },
      });
      // Refresh token
      if (response.status === 401 || response.status === 403) {
        const refreshToken = localStorage.getItem("refreshToken");
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "refresh-token": refreshToken ?? "",
          },
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          if (newAccessToken && newRefreshToken) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            accessToken = newAccessToken;
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/edit`, {
              method: "PATCH",
              body: formData,
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "*/*",
              },
            });
          } else {
            localStorage.clear();
            window.location.href = "/login";
            return false;
          }
        } else {
          localStorage.clear();
          window.location.href = "/login";
          return false;
        }
      }
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error(errorData.message || "Xung đột dữ liệu!", { position: "top-center", autoClose: 3000 });
          return false;
        }
        throw new Error("Cập nhật thất bại");
      }
      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message || "Cập nhật thất bại!", { position: "top-center", autoClose: 3000 });
        return false;
      }
      if (data.code === "success") {
        if (isEmailChanged) {
          toast.success("Cập nhật thành công! Vui lòng đăng nhập lại.", { position: "top-center", autoClose: 3000 });
          localStorage.clear();
          window.location.href = "/login";
          onClose();
          return true;
        } else {
          toast.success("Cập nhật thành công!", { position: "top-center", autoClose: 3000 });
          if (data.data.avatarUrl) {
            setInitialFiles([{ source: data.data.avatarUrl, options: { type: "local" } }]);
            setFileItems([]);
          }
          onClose();
          onSuccess();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Lỗi hệ thống!", { position: "top-center", autoClose: 3000 });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  if (!user || !isOpen) return null;
  // Ưu tiên ảnh mới > ảnh cũ
  const displayFile = fileItems[0] || (initialFiles[0] ? { ...initialFiles[0], file: undefined } : null);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="mb-4 text-center">
          <label className="block font-[500] text-[14px] text-black mb-[5px]">
            Ảnh đại diện
          </label>

          {/* CHỈ DÙNG FilePondInitialFile[] cho files prop */}
          {isEditing && (<FilePond
            name="avatar"
            allowMultiple={false}
            allowRemove={true}
            labelIdle="+"
            acceptedFileTypes={["image/*"]}
            files={initialFiles}
            onupdatefiles={(items: FilePondFile[]) => {
              setFileItems(items);
              if (items.length === 0) {
                setInitialFiles([]);
              }
            }}
            imagePreviewMaxHeight={200}
            className="w-full"
          />)}


          {/* Preview ảnh */}
          {displayFile ? (
            displayFile.file instanceof Blob ? (
              <img
                src={URL.createObjectURL(displayFile.file)}
                alt="Preview"
                className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
              />
            ) : displayFile.source ? (
              <img
                src={displayFile.source}
                alt="Current"
                className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
              />
            ) : (
              <p className="mt-2 text-gray-500">Chưa có ảnh</p>
            )
          ) : (
            <p className="mt-2 text-gray-500">Chưa có ảnh</p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiUser className="text-[#5BC5A7] mr-2" />
              <input
                type="text"
                value={fullName}
                disabled={!isEditing}
                onChange={(e) => setFullName(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isEditing ? "text-gray-900" : "text-gray-600"
                  }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiMail className="text-[#5BC5A7] mr-2" />
              <input
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isEditing ? "text-gray-900" : "text-gray-600"
                  }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FiPhone className="text-[#5BC5A7] mr-2" />
              <input
                type="tel"
                value={phone}
                disabled={!isEditing}
                onChange={(e) => setPhone(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isEditing ? "text-gray-900" : "text-gray-600"
                  }`}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSetEditing}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 w-[200px] h-12 rounded-md text-base font-semibold transition-all duration-300 ${isLoading
                ? "bg-gray-400 cursor-not-allowed text-gray-800"
                : isEditing
                  ? "bg-[#5BC5A7] text-white hover:bg-[#4AA88C]"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : isEditing ? (
              <>
                <FiSave size={18} />
                <span>Lưu thay đổi</span>
              </>
            ) : (
              <>
                <FiEdit3 size={18} />
                <span>Chỉnh sửa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}