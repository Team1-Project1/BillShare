"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { currencies } from "@/config/currencies";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { FiX } from "react-icons/fi";

// Đăng ký plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

interface Group {
  groupId: number;
  name: string;
  description: string;
  defaultCurrency: string;
  avatar: string;
}

interface ModalEditGroupInfoProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdateSuccess: () => void;
}

export default function ModalEditGroupInfo({ isOpen, onClose, group, onUpdateSuccess }: ModalEditGroupInfoProps) {
  const [groupName, setGroupName] = useState<string>(group.name);
  const [description, setDescription] = useState<string>(group.description);
  const [defaultCurrency, setDefaultCurrency] = useState<string>(group.defaultCurrency);
  const [avatars, setAvatars] = useState<any[]>(group.avatar ? [{ source: group.avatar, options: { type: "server" } }] : []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Đồng bộ state khi group thay đổi
  useEffect(() => {
    setGroupName(group.name);
    setDescription(group.description);
    setDefaultCurrency(group.defaultCurrency);
    setAvatars(group.avatar ? [{ source: group.avatar, options: { type: "server" } }] : []);
  }, [group]);

  // Xử lý click ngoài modal để đóng
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

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // Tạo JSON string cho field 'group'
      const groupData = {
        groupName,
        description,
        defaultCurrency,
      };
      const groupJson = JSON.stringify(groupData);

      const formData = new FormData();
      formData.append("group", groupJson);
      // Chỉ append file nếu người dùng chọn ảnh mới
      if (avatars.length > 0 && avatars[0].file instanceof File) {
        formData.append("file", avatars[0].file);
      }

      let accessToken = localStorage.getItem("accessToken");
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/edit/${group.groupId}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          Accept: "*/*",
        },
      });

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
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group/edit/${group.groupId}`, {
              method: "PUT",
              body: formData,
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "*/*",
              },
            });
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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error(errorData.message || "Xung đột dữ liệu khi cập nhật nhóm!", {
            position: "top-center",
            autoClose: 3000,
          });
          return;
        }
        throw new Error("Không thể cập nhật thông tin nhóm");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message || "Không thể cập nhật thông tin nhóm!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      if (data.code === "success") {
        toast.success("Cập nhật thông tin nhóm thành công!", {
          position: "top-center",
          autoClose: 3000,
        });
        // Cập nhật avatar từ server nếu có
        if (data.data.avatarUrl) {
          setAvatars([{ source: data.data.avatarUrl, options: { type: "server" } }]);
        }
        onUpdateSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Không thể cập nhật thông tin nhóm!", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#5BC5A7]">Chỉnh sửa thông tin nhóm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="mb-4 text-center">
          <label htmlFor="avatar" className="block font-[500] text-[14px] text-black mb-[5px]">
            Avatar
          </label>
          <FilePond
            name="avatar"
            allowMultiple={false}
            allowRemove={true}
            labelIdle="+"
            acceptedFileTypes={["image/*"]}
            files={avatars}
            onupdatefiles={(fileItems) => {
              setAvatars(fileItems);
            }}
            imagePreviewMaxHeight={200}
            {...({ imagePreviewMaxWidth: 200 } as any)}
            className="w-full"
          />
          {avatars.length > 0 && avatars[0].file instanceof File ? (
            <img
              src={URL.createObjectURL(avatars[0].file)}
              alt="Preview avatar"
              className="w-24 h-24 rounded-full mx-auto mt-2"
            />
          ) : avatars.length > 0 && avatars[0].source ? (
            <img
              src={avatars[0].source}
              alt="Current avatar"
              className="w-24 h-24 rounded-full mx-auto mt-2"
            />
          ) : (
            <p className="mt-2 text-gray-500">Chưa có ảnh</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm *</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiền tệ</label>
          <select
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleEdit}
          disabled={isLoading}
          className={`w-full h-10 text-white rounded-md text-base font-semibold transition-colors duration-300 flex items-center justify-center ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}