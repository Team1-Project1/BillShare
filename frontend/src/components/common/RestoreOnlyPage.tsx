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
}

export default function RestoreOnlyPage({ groupId, entityId, entityType }: RestoreOnlyPageProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [canRestore, setCanRestore] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id ? Number(id) : null);
  }, []);

  // **KHÔNG GỌI API GET** – vì expense đã xóa → 404
  // → Giả định: nếu bạn vào được trang này → bạn có quyền khôi phục
  // → Chỉ cần userId tồn tại → cho restore
  useEffect(() => {
    if (userId) {
      setCanRestore(true);
      setLoading(false);
    }
  }, [userId]);

  const handleRestore = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/${entityType}s/${entityId}/restore`,
        { method: "PUT" }
      );

      if (res.ok) {
        toast.success(
          entityType === "expense" ? "Đã khôi phục khoản chi!" : "Đã khôi phục thanh toán!",
          { position: "top-center", autoClose: 2000 }
        );
        router.push(`/activities`);
      } else {
        const err = await res.json();
        toast.error(err.message || "Không thể khôi phục!", { position: "top-center" });
      }
    } catch (err) {
      toast.error("Lỗi khi khôi phục!", { position: "top-center" });
    }
  };

  if (loading || !userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {entityType === "expense" ? "Khoản chi" : "Khoản thanh toán"} đã bị xóa
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn có thể khôi phục ngay bây giờ.
          </p>

          <button
            onClick={handleRestore}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
          >
            Khôi phục ngay
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}