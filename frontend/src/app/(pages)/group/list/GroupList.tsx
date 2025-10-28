"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardGroup from "@/components/card/CardGroup";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const size = 10;

  const fetchGroups = async (page: number) => {
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
      console.log("Group list API response:", data);

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

        setGroups((prev) => [...prev, ...activeGroups]);
        setTotalGroups(pageableData.totalElements);
        setHasMore(!pageableData.last);
        toast.success("Tải danh sách nhóm thành công!");
      }
    } catch (err) {
      console.error("Fetch group list error:", err);
      toast.error("Không thể tải danh sách nhóm!");
    } finally {
      if (page === 0) setLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Không tìm thấy userId, vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }
    fetchGroups(0);
  }, []);

  const loadMore = () => {
    if (!hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchGroups(nextPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-100 py-6 px-4"
      style={{ maxWidth: "576px", margin: "0 auto" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#5BC5A7]">
          Danh sách nhóm
        </h1>
        <p className="text-sm text-gray-600">Tổng số nhóm: {totalGroups}</p>
      </div>
      <InfiniteScroll
        dataLength={groups.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5BC5A7]"></div>
          </div>
        }
        endMessage={
          <p className="text-center text-gray-600 mt-4">Đã tải hết danh sách nhóm.</p>
        }
      >
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
      </InfiniteScroll>
    </div>
  );
}