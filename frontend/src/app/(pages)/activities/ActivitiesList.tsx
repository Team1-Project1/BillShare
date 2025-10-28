"use client";

import { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import CardActivity from "@/components/card/CardActivity";
import { FiActivity } from "react-icons/fi";

interface Transaction {
  transactionId: number;
  groupId: number;
  groupName: string;
  userId: number;
  userName: string;
  actionType: string;
  entityType: string;
  entityId: number;
  timestamp: string;
}

export default function ActivitiesList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchTransactions = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      console.log(`Fetching page: ${pageNum}`);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?page=${pageNum}&size=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Lỗi tải dữ liệu");

      const data = await response.json();
      console.log("API Response:", data);

      if (data.code === "success") {
        const newTransactions = data.data.content || [];
        const totalPages = data.data.totalPages || 0;
        const currentPage = data.data.number || 0;

        // Loại bỏ trùng transactionId
        const seenIds = new Set<number>();
        const uniqueTransactions = newTransactions.filter((t: Transaction) => {
          if (seenIds.has(t.transactionId)) {
            console.warn(`Trùng transactionId: ${t.transactionId} - Bỏ qua bản ghi này`);
            return false;
          }
          seenIds.add(t.transactionId);
          return true;
        });

        setTransactions((prev) => {
          // Khi load more: loại bỏ trùng với dữ liệu cũ
          if (pageNum === 0) return uniqueTransactions;

          const existingIds = new Set(prev.map(t => t.transactionId));
          const filteredNew = uniqueTransactions.filter((t: { transactionId: number; }) => !existingIds.has(t.transactionId));
          return [...prev, ...filteredNew];
        });

        const nextPage = currentPage + 1;
        const shouldLoadMore = nextPage < totalPages && uniqueTransactions.length > 0;
        setHasMore(shouldLoadMore);

        console.log(`Page ${pageNum} -> totalPages: ${totalPages}, hasMore: ${shouldLoadMore}`);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setHasMore(false);
    } finally {
      if (isLoadMore || pageNum === 0) {
        setIsInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FiActivity className="text-[#5BC5A7]" size={20} />
        <h2 className="text-lg font-semibold text-[#5BC5A7]">Hoạt động gần đây</h2>
      </div>

      <InfiniteScroll
        dataLength={transactions.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#5BC5A7]"></div>
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 text-sm py-4">
            Đã hiển thị tất cả hoạt động
          </p>
        }
      >
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.transactionId}
              className="cursor-default"
            >
              <CardActivity activity={transaction} />
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {transactions.length === 0 && !isInitialLoading && (
        <p className="text-center text-gray-500 py-8">Chưa có hoạt động nào</p>
      )}
    </div>
  );
}