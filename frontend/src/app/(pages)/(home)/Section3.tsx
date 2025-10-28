"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardGroup from "@/components/card/CardGroup";
import { FiUsers } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Link from "next/link";

interface Section3Props {
  onOpenModal: () => void;
}

interface Group {
  groupId: number;
  groupName: string;
  description: string;
  createdBy: number;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  avatarUrl: string;
}

interface PageableResponse {
  content: Group[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const Section3 = ({ onOpenModal }: Section3Props) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const page = 0;
  const size = 3;

  useEffect(() => {
    const fetchGroups = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Không tìm thấy userId, vui lòng đăng nhập lại!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/group/list-group?page=${page}&size=${size}`,
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
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            return;
          }
          throw new Error("Không thể tải danh sách nhóm");
        }

        const data = await response.json();
        if (data.code === "error") {
          toast.error(data.message);
          return;
        }

        if (data.code === "success") {
          const pageableData: PageableResponse = data.data;
          const activeGroups = pageableData.content
            .filter((group: Group) => group.isActive)
            .map((group: Group) => ({
              ...group,
              description: group.description || "Không có mô tả",
              defaultCurrency: group.defaultCurrency || "VND",
            }));
          setGroups(activeGroups);
          setTotalGroups(pageableData.totalElements);
          toast.success("Tải danh sách nhóm thành công!");
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch group list error:", err);
        toast.error("Không thể tải danh sách nhóm!");
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] bg-gray-100 py-6 px-4 flex justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-md rounded-lg max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nhóm</h3>
        <p className="text-sm text-gray-600">Tổng số nhóm: {totalGroups}</p>
      </div>
      <button
        onClick={onOpenModal}
        className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4"
      >
        <FiUsers className="mr-2" /> Tạo nhóm
      </button>
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
              avatarUrl={group.avatarUrl}
            />
          ))
        )}
      </div>
      {totalGroups > 3 && (
        <Link href="/group/list" className="block mt-4">
          <button className="w-full h-10 bg-gray-200 text-gray-800 rounded-md text-base font-medium hover:bg-gray-300 transition-colors duration-300">
            Xem thêm
          </button>
        </Link>
      )}
    </div>
  );
};