"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardGroup from "@/components/card/CardGroup";
import { FiUsers } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Section3Props {
  onOpenModal: () => void;
}

interface Group {
  groupId: number;
  groupName: string;
  description: string;
  defaultCurrency: string;
  isActive: boolean;
}

export const Section3 = ({ onOpenModal }: Section3Props) => {
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
    <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhóm</h3>
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
      <button
        onClick={onOpenModal}
        className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
      >
        <FiUsers className="mr-2" /> Tạo nhóm
      </button>
    </div>
  );
};