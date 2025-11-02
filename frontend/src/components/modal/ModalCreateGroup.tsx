"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
// SỬA: Xóa CardMemberSelect không dùng đến
// import CardMemberSelect from "../card/CardMemberSelect";
import { currencies } from "@/config/currencies";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import type { FilePondFile } from "filepond"; // SỬA: Import type cho FilePond

// Đăng ký plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

export default function ModalCreateGroup({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  // SỬA: Xóa state 'selectedMembers' không dùng đến
  // const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState("VND");
  const [avatars, setAvatars] = useState<FilePondFile[]>([]); // SỬA: Dùng type FilePondFile[]
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // SỬA: Xóa 'members' không dùng đến
  // const members = [[]];

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

  useEffect(() => {
    setGroupName("");
    setGroupDesc("");
    setDefaultCurrency("VND");
    setAvatars([]);
    setIsCreating(false);
  }, [isOpen]);

  // SỬA: Xóa hàm 'handleSelectMember' không dùng đến
  // const handleSelectMember = (id: number) => { ... };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
          position: "top-center",
          autoClose: 3000,
        });
        setIsCreating(false);
        return;
      }

      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm!", {
          position: "top-center",
          autoClose: 3000,
        });
        setIsCreating(false);
        return;
      }

      const groupData = {
        groupName,
        description: groupDesc || "Không có mô tả",
        defaultCurrency,
      };
      const groupJson = JSON.stringify(groupData);

      const formData = new FormData();
      formData.append("group", groupJson);
      if (avatars.length > 0 && avatars[0].file) {
        formData.append("file", avatars[0].file);
      }

      let accessToken = localStorage.getItem("accessToken");
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/group/create`,
        {
          method: "POST",
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
          const data = await refreshRes.json();
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            accessToken = newAccessToken;
            response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/group/create`,
              {
                method: "POST",
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
            setIsCreating(false);
            return;
          }
        } else {
          localStorage.clear();
          window.location.href = "/login";
          setIsCreating(false);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo nhóm");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
        });
        setIsCreating(false);
        return;
      }

      if (data.code === "success") {
        toast.success("Tạo nhóm thành công!", {
          position: "top-center",
          autoClose: 2000,
        });
        onSuccess?.();
        onClose();
      }
    } catch (err) { // SỬA: Xóa 'err' không dùng đến
      let message = "Không thể tạo nhóm!";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200 
          max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4 ">
          <h2 className="text-lg font-semibold text-gray-900">Tạo Nhóm</h2>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className={`w-24 h-10 text-white rounded-md text-base font-semibold transition-colors duration-300 flex items-center justify-center ${
              isCreating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
            }`}
          >
            {isCreating ? "Đang tạo" : "Tạo"}
          </button>
        </div>
        <h3 className="text-base font-medium text-gray-700 mb-2">
          Thông tin nhóm
        </h3>
        <div className="mb-4 text-center">
          <label
            htmlFor="avatar"
            className="block font-[500] text-[14px] text-black mb-[5px]"
          >
            Avatar
          </label>
          <FilePond
            name="avatar"
            allowMultiple={false}
            allowRemove={true}
            labelIdle="+"
            acceptedFileTypes={["image/*"]}
            files={avatars.map((avatar) => avatar.file)} // FilePond mong đợi File objects
            onupdatefiles={(fileItems) => {
              setAvatars(fileItems as FilePondFile[]); // Cập nhật state với FilePondFile
            }}
            imagePreviewMaxHeight={200}
            className="w-full"
          />
          {avatars.length > 0 && avatars[0].file && (
            <img
              src={URL.createObjectURL(avatars[0].file)}
              alt="Preview avatar"
              className="w-24 h-24 rounded-full mx-auto mt-2"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên nhóm
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thông tin mô tả
          </label>
          <textarea
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiền tệ mặc định
          </label>
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
        <h3 className="text-base font-medium text-gray-700 mb-2">
          Thêm thành viên
        </h3>
        
      </div>
    </div>
  );
}