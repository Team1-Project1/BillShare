// src/components/common/RestoreOnlyPage.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import { BottomNav } from "@/components/Footer/BottomNav";
import { useRouter } from "next/navigation";

interface RestoreOnlyPageProps {
  groupId: number;
  entityId: number;
  entityType: "expense" | "payment";
  children?: React.ReactNode; // Chi tiết đã xóa
}

export default function RestoreOnlyPage({ groupId, entityId, entityType, children }: RestoreOnlyPageProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [canRestore, setCanRestore] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  useEffect(() => {
    if (userId) setCanRestore(true);
  }, [userId]);

  const handleRestore = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/${entityType}s/${entityId}/restore`,
        { method: "PUT" }
      );
      if (res.ok) {
        toast.success("Đã khôi phục!", { position: "top-center" });
        router.push("/activities");
      } else {
        toast.error("Không thể khôi phục!", { position: "top-center" });
      }
    } catch {
      toast.error("Lỗi!", { position: "top-center" });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {entityType === "expense" ? "Khoản chi" : "Khoản thanh toán"} đã bị xóa
          </h2>
          <p className="text-sm text-gray-600">Bạn có thể khôi phục nếu là người tạo.</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 opacity-80">
          {children || <p className="text-center text-gray-500">Không có dữ liệu</p>}
        </div>

        <button
          onClick={handleRestore}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
        >
          Khôi phục ngay
        </button>
      </div>
      <BottomNav />
    </div>
  );
}