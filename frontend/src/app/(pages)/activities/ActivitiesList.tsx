// src/app/(pages)/activities/ActivitiesList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import CardActivity from "@/components/card/CardActivity";
import { FiActivity, FiTrash2 } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [mode, setMode] = useState<"normal" | "deleted">("normal");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlGroupId = searchParams.get("groupId");

  const fetchTransactions = useCallback(async (pageNum: number) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?page=${pageNum}&size=15`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.code === "success") {
        const newItems = data.data.content || [];
        setTransactions(prev => pageNum === 0 ? newItems : [...prev, ...newItems]);
        setHasMore((data.data.number + 1) < data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTransactions([]);
    setPage(0);
    fetchTransactions(0);
  }, [mode, fetchTransactions]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTransactions(next);
  };

  const deletedTransactions = transactions.filter(t => t.actionType.toLowerCase() === "delete");
  const normalTransactions = transactions;

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div></div>;
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === "normal" ? <FiActivity className="text-[#5BC5A7]" size={20} /> : <FiTrash2 className="text-red-500" size={20} />}
          <h2 className="text-lg font-semibold text-[#5BC5A7]">
            {mode === "normal" ? "Hoạt động gần đây" : "Thùng rác"}
          </h2>
        </div>
        <button
          onClick={() => setMode(mode === "normal" ? "deleted" : "normal")}
          className={`px-3 py-1 rounded-full text-[14px] font-medium transition-all ${
            mode === "deleted"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {mode === "normal" ? "Hiện đã xóa" : "Ẩn"}
        </button>
      </div>

      {mode === "normal" ? (
        <InfiniteScroll
          dataLength={normalTransactions.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5BC5A7]"></div></div>}
          endMessage={<p className="text-center text-gray-500 text-sm py-4">Đã hiển thị tất cả</p>}
        >
          <div className="space-y-3">
            {normalTransactions.map(t => (
              <div
                key={t.transactionId}
                onClick={() => {
                  if (t.entityType === "expense") {
                    router.push(`/activities/expense-detail?groupId=${t.groupId}&expenseId=${t.entityId}&actionType=${t.actionType}`);
                  } else if (t.entityType === "payment") {
                    router.push(`/activities/payment-detail?groupId=${t.groupId}&paymentId=${t.entityId}&actionType=${t.actionType}`);
                  }
                }}
                className="cursor-pointer"
              >
                <CardActivity activity={t} />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="space-y-3">
          {deletedTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Thùng rác trống</p>
          ) : (
            deletedTransactions.map(t => (
              <div
                key={t.transactionId}
                onClick={() => {
                  if (t.entityType === "expense") {
                    router.push(`/activities/expense-detail?groupId=${t.groupId}&expenseId=${t.entityId}&actionType=delete`);
                  } else if (t.entityType === "payment") {
                    router.push(`/activities/payment-detail?groupId=${t.groupId}&paymentId=${t.entityId}&actionType=delete`);
                  }
                }}
                className="cursor-pointer"
              >
                <CardActivity activity={t} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}