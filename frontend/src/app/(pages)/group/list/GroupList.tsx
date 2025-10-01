"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardGroup from "@/components/card/CardGroup";
import { Metadata } from "next";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const metadata: Metadata = {
  title: "Danh sách nhóm",
  description: "Mô tả trang danh sách nhóm...",
};

interface Group {
  groupId: number;
  groupName: string;
  description: string;
  defaultCurrency: string;
  isActive: boolean;
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/group/list-group`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            });
            return;
          }
          throw new Error("Không thể tải danh sách nhóm");
        }

        const data = await response.json();
        console.log("Group list API response:", data); // Debug API response
        if (data.code === "error") {
          toast.error(data.message, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          return;
        }

        if (data.code === "success") {
          const activeGroups = data.data
            .filter((group: Group) => group.isActive && group.groupId !== undefined && group.groupId !== null)
            .map((group: Group) => ({
              ...group,
              description: group.description || "Không có mô tả",
              defaultCurrency: group.defaultCurrency || "VND",
            }));
          setGroups(activeGroups);
          toast.success("Tải danh sách nhóm thành công!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch group list error:", err); // Debug error
        toast.error("Không thể tải danh sách nhóm!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <p className="text-gray-600">Đang tải...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4" style={{ maxWidth: "576px", margin: "0 auto" }}>
      <h1 className="text-2xl font-bold text-[#5BC5A7] mb-6">Danh sách nhóm</h1>
      <div className="space-y-4">
        {groups.length === 0 ? (
          <p className="text-gray-600">Chưa có nhóm nào.</p>
        ) : (
          groups.map((group) => (
            <CardGroup
              key={group.groupId}
              groupId={group.groupId}
              groupName={group.groupName}
              description={group.description}
              defaultCurrency={group.defaultCurrency}
              memberCount={0} // Cập nhật nếu có API lấy số thành viên
            />
          ))
        )}
      </div>
    </div>
  );
}