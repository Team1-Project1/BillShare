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

import type { FilePondFile } from "filepond";

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

export default function ModalEditGroupInfo({
  isOpen,
  onClose,
  group,
  onUpdateSuccess,
}: ModalEditGroupInfoProps) {
  const [groupName, setGroupName] = useState<string>(group.name);
  const [description, setDescription] = useState<string>(group.description);
  const [defaultCurrency, setDefaultCurrency] = useState<string>(group.defaultCurrency);

  // Dùng để load ảnh cũ (chỉ string URL)
  const [initialFiles, setInitialFiles] = useState<string[]>(
    group.avatar ? [group.avatar] : []
  );

  // Dùng để lấy file mới
  const [fileItems, setFileItems] = useState<FilePondFile[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGroupName(group.name);
    setDescription(group.description);
    setDefaultCurrency(group.defaultCurrency);
    setInitialFiles(group.avatar ? [group.avatar] : []);
    setFileItems([]);
  }, [group]);

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
        toast.error("Không tìm thấy thông tin người dùng!");
        return;
      }

      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm!");
        return;
      }

      const groupData = { groupName, description, defaultCurrency };
      const formData = new FormData();
      formData.append("group", JSON.stringify(groupData));

      if (fileItems.length > 0 && fileItems[0].file instanceof File) {
        formData.append("file", fileItems[0].file);
      }

      let accessToken = localStorage.getItem("accessToken");
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/group/edit/${group.groupId}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            Accept: "*/*",
          },
        }
      );

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

            response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/group/edit/${group.groupId}`,
              {
                method: "PUT",
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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error(errorData.message || "Xung đột dữ liệu!");
          return;
        }
        throw new Error("Cập nhật thất bại");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message || "Cập nhật thất bại!");
        return;
      }

      if (data.code === "success") {
        toast.success("Cập nhật thành công!");
        if (data.data.avatarUrl) {
          setInitialFiles([data.data.avatarUrl]);
        }
        setFileItems([]);
        onUpdateSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200 max-h-[90vh] flex flex-col min-h-0"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "all 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-[#5BC5A7]">Chỉnh sửa thông tin nhóm</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain pr-1">
          <div className="mb-4 text-center">
            <label className="block font-medium text-black mb-2">Avatar</label>

            <FilePond
              name="avatar"
              allowMultiple={false}
              allowRemove={true}
              labelIdle="+"
              acceptedFileTypes={["image/*"]}
              files={initialFiles} // Chỉ string
              onupdatefiles={(items: FilePondFile[]) => {
                setFileItems(items);
                if (items.length === 0) {
                  setInitialFiles([]);
                }
              }}
              imagePreviewMaxHeight={200}
              className="w-full"
            />

            {fileItems.length > 0 && fileItems[0].file ? (
              <img
                src={URL.createObjectURL(fileItems[0].file)}
                alt="Preview"
                className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
              />
            ) : initialFiles.length > 0 ? (
              <img
                src={initialFiles[0]}
                alt="Current"
                className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
              />
            ) : (
              <p className="mt-2 text-gray-500">Chưa có ảnh</p>
            )}
          </div>

          {/* Các input khác */}
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
              className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiền tệ</label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleEdit}
          disabled={isLoading}
          className={`w-full h-10 text-white rounded-md text-base font-semibold mt-4 shrink-0 ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}