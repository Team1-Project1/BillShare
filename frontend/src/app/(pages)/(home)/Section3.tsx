"use client";

import { useState, useEffect, use } from "react";
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
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Không tìm thấy userId, vui lòng đăng nhập lại!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/group/list-group/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "*/*",
            },
          }
        );

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
          const activeGroups = data.data.groups
            .filter(
              (group: Group) =>
                group.isActive &&
                group.groupId !== undefined &&
                group.groupId !== null
            )
            .map((group: Group) => ({
              ...group,
              description: group.description || "Không có mô tả",
              defaultCurrency: group.defaultCurrency || "VND",
            }));
          setGroups(activeGroups);
          setTotalGroups(data.data.totalGroups || 0);
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
        console.error("Fetch group list error:", err);
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
    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-md rounded-lg max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Nhóm</h3>
        <p className="text-sm text-gray-600">Tổng số nhóm: {totalGroups}</p>
      </div>
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