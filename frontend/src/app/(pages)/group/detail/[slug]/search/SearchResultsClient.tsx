"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import CardExpense from "@/components/card/CardExpense";
import { SearchBar } from "@/components/bar/SearchBar";
import { BottomNav } from "@/components/Footer/BottomNav";
import { useRouter } from "next/navigation";

interface Expense {
  expenseId: number;
  categoryId: number;
  expenseName: string;
  expenseDate: string;
  totalAmount?: number; // Thêm trường totalAmount để lưu khi gọi API chi tiết
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  debt: number;
}

interface Group {
  groupId: number;
  name: string;
  description: string;
  defaultCurrency: string;
  avatar: string;
  memberCount: number;
  totalCost: number;
  netAmount: number;
  members: Member[];
  createdBy: number;
}

interface SearchResultsClientProps {
  groupId: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchResultsClient({
  groupId,
  searchParams,
}: SearchResultsClientProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = Number(localStorage.getItem("userId"));
  const router = useRouter();

  const fetchGroupDetails = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải chi tiết nhóm");
      }

      const data = await response.json();
      if (data.code === "success") {
        const apiGroup = data.data;
        setGroup({
          groupId: apiGroup.groupId,
          name: apiGroup.groupName,
          description: apiGroup.description || "Không có mô tả",
          defaultCurrency: apiGroup.defaultCurrency || "VND",
          avatar:
            apiGroup.avatarUrl ||
            "https://res.cloudinary.com/dtpxp9qqf/image/upload/v1750519773/xholultqlsq1bscqj7bv.jpg",
          memberCount: apiGroup.members.length,
          members: apiGroup.members.map((member: any) => ({
            id: member.userId,
            name: member.fullName,
            email: member.email,
            avatar: member.avatarUrl || undefined,
            debt: 0,
          })),
          createdBy: apiGroup.createdBy,
          totalCost: 0,
          netAmount: 0,
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải chi tiết nhóm!", { position: "top-center" });
    }
  };

  const fetchExpenseDetails = async (expenseId: number) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/${expenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Không thể tải chi tiết khoản chi ${expenseId}`);
      }

      const data = await response.json();
      if (data.code === "success") {
        return data.data.totalAmount;
      }
      return 0;
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(`Không thể tải chi tiết khoản chi ${expenseId}`, {
        position: "top-center",
      });
      return 0;
    }
  };

  const fetchSearchResults = async () => {
    if (!userId || (group && !group.members.some((member) => member.id === userId))) {
      toast.error("Bạn không phải là thành viên của nhóm này!", {
        position: "top-center",
        autoClose: 2000,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.categoryId)
        queryParams.append("categoryId", searchParams.categoryId as string);
      if (searchParams.expenseName)
        queryParams.append("expenseName", searchParams.expenseName as string);
      if (searchParams.expenseDateFrom)
        queryParams.append("expenseDateFrom", searchParams.expenseDateFrom as string);
      if (searchParams.expenseDateTo)
        queryParams.append("expenseDateTo", searchParams.expenseDateTo as string);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/expenses/search?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            userId: userId.toString(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải kết quả tìm kiếm");
      }

      const data = await response.json();
      if (data.code === "success") {
        const expenseIds = data.data.map((expense: any) => expense.expenseId);
        const amounts = await Promise.all(
          expenseIds.map((id: number) => fetchExpenseDetails(id))
        );
        const updatedExpenses = data.data.map((expense: any, index: number) => ({
          ...expense,
          totalAmount: amounts[index],
        }));
        setExpenses(updatedExpenses);
        toast.success("Tìm kiếm thành công!", { position: "top-center" });
      } else {
        toast.error(data.message, { position: "top-center" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải kết quả tìm kiếm!", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchGroupDetails();
      await fetchSearchResults();
    };
    loadData();
  }, [groupId, searchParams]);

  if (loading || !group) {
    return <p className="text-gray-600 text-center">Đang tải...</p>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
      <div className="w-full max-w-[576px] mx-auto">
        <SearchBar groupId={groupId} members={group.members} isSearchOpen={true} />
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mt-6">
          <h2 className="text-lg font-semibold text-[#5BC5A7] mb-4">
            Kết quả tìm kiếm
          </h2>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <CardExpense
                  key={expense.expenseId}
                  expenseId={expense.expenseId}
                  groupId={groupId}
                  name={expense.expenseName}
                  date={expense.expenseDate}
                  amount={expense.totalAmount || 0} // Sử dụng totalAmount từ API
                  currency={group.defaultCurrency}
                  userId={userId}
                  members={group.members}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic text-center">
              Không tìm thấy khoản chi nào.
            </p>
          )}
          <button
            onClick={() => router.push(`/group/detail/${groupId}`)}
            className="mt-4 w-full h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors flex items-center justify-center"
          >
            Back
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}