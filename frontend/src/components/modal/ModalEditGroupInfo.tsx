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
// Import type đúng
import type { FilePondFile, FilePondInitialFile } from "filepond";
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
  // CHỈ DÙNG FilePondInitialFile CHO files prop
  const [initialFiles, setInitialFiles] = useState<FilePondInitialFile[]>(
    group.avatar
      ? [{ source: group.avatar, options: { type: "local" } }]
      : []
  );
  // DÙNG FilePondFile CHO state khi người dùng thêm/xóa file
  const [fileItems, setFileItems] = useState<FilePondFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // Đồng bộ khi group thay đổi
  useEffect(() => {
    setGroupName(group.name);
    setDescription(group.description);
    setDefaultCurrency(group.defaultCurrency);
    setInitialFiles(
      group.avatar
        ? [{ source: group.avatar, options: { type: "local" } }]
        : []
    );
  }, [isOpen]);

  // Click outside
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
        toast.error("Không tìm thấy thông tin người dùng!", { position: "top-center", autoClose: 3000 });
        return;
      }
      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm!", { position: "top-center", autoClose: 3000 });
        return;
      }
      const groupData = { groupName, description, defaultCurrency };
      const formData = new FormData();
      formData.append("group", JSON.stringify(groupData));
      // Chỉ upload nếu có file mới (fileItems[0] tồn tại và có .file)
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
          toast.error(errorData.message || "Xung đột dữ liệu!", { position: "top-center", autoClose: 3000 });
          return;
        }
        throw new Error("Cập nhật thất bại");
      }
      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message || "Cập nhật thất bại!", { position: "top-center", autoClose: 3000 });
        return;
      }

      if (data.code === "success") {
        toast.success("Cập nhật thành công!", { position: "top-center", autoClose: 3000 });
        console.log("Display File:", displayFile);

        if (data.data.avatarUrl) {
          // Cập nhật lại initialFiles để hiển thị ảnh mới
          setInitialFiles([{ source: data.data.avatarUrl, options: { type: "local" } }]);
          setFileItems([]); // Xóa file tạm
        }
        onUpdateSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống!", { position: "top-center", autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayFile =
    fileItems.length > 0
      ? fileItems[0]
      : initialFiles.length > 0
        ? initialFiles[0]
        : null;


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
          {!isLoading && (          <div className="mb-4 text-center">
            <label className="block font-medium text-black mb-2">Avatar</label>

            {/* CHỈ truyền FilePondInitialFile[] vào files */}
            <FilePond
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
            />

            {/* Preview */}
            {displayFile ? (
              "file" in displayFile && displayFile.file instanceof File ? (
                <img
                  src={URL.createObjectURL(displayFile.file)}
                  alt="Preview"
                  className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
                />
              ) : (displayFile as FilePondInitialFile).source ? (
                <img
                  src={(displayFile as FilePondInitialFile).source}
                  alt="Current"
                  className="w-24 h-24 rounded-full mx-auto mt-2 object-cover"
                />
              ) : (
                <p className="mt-2 text-gray-500">Chưa có ảnh</p>
              )
            ) : (
              <p className="mt-2 text-gray-500">Chưa có ảnh</p>
            ) }
          </div>)}

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
          className={`w-full h-10 text-white rounded-md text-base font-semibold mt-4 shrink-0 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5BC5A7] hover:bg-[#4AA88C]"
            }`}
        >
          {isLoading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}