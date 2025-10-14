"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CardExpense from "@/components/card/CardExpense";
import CardFriendEnhanced from "@/components/card/CardFriendEnhanced";
import { BottomNav } from "@/components/Footer/BottomNav";
import Head from "next/head";
import {
  FiUsers,
  FiMoreVertical,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiDownload,
  FiUserPlus,
  FiEdit,
  FiEye,
} from "react-icons/fi";
import ModalAddMember from "@/components/modal/ModalAddMember";
import ModalViewAllMembers from "@/components/modal/ModalViewAllMembers";
import ModalConfirmDelete from "@/components/modal/ModalConfirmDelete";
import ModalEditGroupInfo from "@/components/modal/ModalEditGroupInfo";
import ModalViewAllExpense from "@/components/modal/ModalViewAllExpense";
import ModalAddExpense from "@/components/modal/ModalAddExpense";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";
import { SearchBar } from "@/components/bar/SearchBar";

interface APIMember {
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  joinAt: string;
  avatarUrl: string | null;
  isActive: boolean;
  role: string;
}

interface Participant {
  participantId: number;
  userId: number;
  userName: string;
  userEmail: string;
  shareAmount: number;
  currency: string;
}

interface ExpenseDetail {
  expenseId: number;
  groupId: number;
  totalAmount: number;
  payerUserId: number;
  createdByUserId: number;
  participants: Participant[];
  currency: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Expense {
  expenseId: number;
  groupId: number;
  name: string;
  date: string;
  amount: number;
  currency: string;
}

interface Balances {
  userId: number;
  userName: string;
  amount: number;
  isOwed: boolean;
}

interface Group {
  groupId: number;
  name: string;
  description: string;
  defaultCurrency: string;
  avatar: string;
  memberCount: number;
  netAmount: number;
  totalCost: number;
  members: Member[];
  expenses: Expense[];
  createdBy: number;
}

export default function GroupDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { userId } = useAuthRefresh();

  const [group, setGroup] = useState<Group>({
    groupId: 0,
    name: "Nhóm A",
    description: "Không có mô tả",
    defaultCurrency: "VND",
    avatar: "",
    memberCount: 0,
    netAmount: 0,
    totalCost: 0,
    members: [],
    expenses: [],
    createdBy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditGroupInfoOpen, setIsEditGroupInfoOpen] = useState(false);
  const [isViewAllExpensesOpen, setIsViewAllExpensesOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [balances, setBalances] = useState<Balances[]>([]);
  const canShowDelete = userId === group.createdBy;
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchGroupDetails = async () => {
    if (!slug || isNaN(Number(slug))) {
      console.error("Invalid groupId:", slug);
      toast.error("ID nhóm không hợp lệ!", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
            position: "top-center",
          });
          return;
        }
        throw new Error("Không thể tải chi tiết nhóm");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message, { position: "top-center" });
        return;
      }

      if (data.code === "success") {
        const apiGroup = data.data;
        setGroup((prev) => ({
          ...prev,
          groupId: apiGroup.groupId,
          name: apiGroup.groupName,
          description: apiGroup.description || "Không có mô tả",
          defaultCurrency: apiGroup.defaultCurrency || "VND",
          avatar: apiGroup.avatar || "https://res.cloudinary.com/dtpxp9qqf/image/upload/v1750519773/xholultqlsq1bscqj7bv.jpg", // Sử dụng apiGroup.avatar thay vì avatarUrl
          memberCount: apiGroup.members.length,
          members: apiGroup.members.map((member: APIMember) => ({
            id: member.userId,
            name: member.fullName,
            email: member.email,
            avatar: member.avatarUrl || undefined,
            debt: 0,
          })),
          createdBy: apiGroup.createdBy,
        }));
        toast.success("Tải chi tiết nhóm thành công!", {
          position: "top-center",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải chi tiết nhóm!", { position: "top-center" });
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!slug || isNaN(Number(slug))) {
      console.error("Invalid groupId:", slug);
      toast.error("ID nhóm không hợp lệ!", { position: "top-center" });
      setLoading(false);
      return;
    }

    setExpensesLoading(true);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${slug}/expenses`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
            position: "top-center",
          });
          return;
        }
        throw new Error("Không thể tải các khoản chi");
      }

      const data = await response.json();
      if (data.code === "error") {
        toast.error(data.message, { position: "top-center" });
        return;
      }

      if (data.code === "success" && Array.isArray(data.data)) {
        const mappedExpenses: Expense[] = data.data.map((item: any) => ({
          expenseId: item.expenseId,
          groupId: item.groupId,
          name: item.expenseName,
          date: item.expenseDate,
          amount: item.totalAmount,
          currency: group.defaultCurrency,
        }));

        const totalCost = data.data.reduce(
          (sum: number, item: any) => sum + item.totalAmount,
          0
        );

        
        setGroup((prev) => ({
          ...prev,
          expenses: mappedExpenses,
          totalCost,
          members: prev.members.map((member) => ({
            ...member,
          })),
        }));

        toast.success("Tải các chi tiêu thành công!", {
          position: "top-center",
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải các chi tiêu!", { position: "top-center" });
      setLoading(false);
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchBalances = async () => {
    if (!slug || isNaN(Number(slug))) {
      console.error("Invalid groupId:", slug);
      toast.error("ID nhóm không hợp lệ!", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${slug}/users/${userId}/balances`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
            position: "top-center",
          });
          return;
        } throw new Error("Không thể tải số dư");
      }
      const data = await response.json();
      
      if ( Array.isArray(data.balances)) {
        const mappedBalances: Balances[] = data.balances.map((item: any) => ({
          userId: item.userId,
          userName: item.userName,
          amount: item.amount,
          isOwed: item.isOwed,
        }));

        let netAmount = 0;
        mappedBalances.forEach((b) => {
          if (b.isOwed) {
            netAmount += b.amount;
          } else {
            netAmount -= b.amount;
          }
        });

        setGroup((prev) => ({
          ...prev,
          netAmount: netAmount,
        }));

        setBalances(mappedBalances);
        toast.success("Tải số dư thành công!", { position: "top-center" });
      } else {
        toast.error("Không thể tải số dư!", { position: "top-center" });
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải số dư!", { position: "top-center" });
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchGroupDetails();
      await fetchExpenses();
    };
    loadData();
  }, [slug]);

  useEffect(() => {
    console.log("UserID in GroupDetailClient:", userId);
    const loafData = async () => {
      if (!userId) return;
      await fetchBalances();
    };
    loafData();
  }, [slug, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInviteSuccess = () => {
    fetchGroupDetails();
  };

  const handleEditExpenseSuccess = () => {
    fetchExpenses();
    fetchBalances();
  }

  const handleDeleteGroup = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${group.groupId}/delete-by/${group.createdBy}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      if (response.ok) {
        toast.success("Xóa nhóm thành công!", { position: "top-center" });
        setIsConfirmDeleteOpen(false);
        router.push("/group/list");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Không thể xóa nhóm!", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể xóa nhóm!", { position: "top-center" });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-600 text-center">Đang tải...</p>;

  return (
    <>
      <Head>
        <title>Chi tiết nhóm</title>
        <meta name="description" content="Mô tả trang chi tiết nhóm..." />
      </Head>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
        style={{
          filter:
            isModalOpen ||
            isViewAllModalOpen ||
            isConfirmDeleteOpen ||
            isEditGroupInfoOpen ||
            isAddExpenseModalOpen ||
            isViewAllExpensesOpen
              ? "blur(5px) brightness(0.8)"
              : "none",
          transition: "filter 0.3s",
        }}
      >
        <div className="w-full max-w-[576px] mx-auto">
          <SearchBar groupId={group.groupId} members={group.members} />
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src={group.avatar}
                  alt="Avatar nhóm"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-[#5BC5A7]">
                    {group.name}
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiUsers className="mr-1" />{" "}
                    {loading ? "Đang tải..." : `${group.memberCount} thành viên`}
                  </p>
                  <p
                    className={`text-md text-gray-600 mt-2 line-clamp-2 ${
                      group.description === "Không có mô tả" ? "italic" : ""
                    }`}
                  >
                    Mô tả: {loading ? "Đang tải..." : group.description}
                  </p>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <FiMoreVertical
                  className="text-[#5BC5A7] cursor-pointer"
                  size={24}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {canShowDelete && (
                      <button
                        onClick={() => {
                          setIsConfirmDeleteOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-[rgba(227,76,76,0.2)] w-full text-left"
                      >
                        <FiTrash2 className="mr-2" /> Xóa
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditGroupInfoOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiEdit className="mr-2" /> Đổi thông tin nhóm
                    </button>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiDownload className="mr-2" /> Xuất CSV
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">
                  Tổng chi phí
                </h2>
                <p className="text-2xl font-[700] text-gray-700">
                  {loading || expensesLoading
                    ? "Đang tải..."
                    : `${group.totalCost.toLocaleString()} ${group.defaultCurrency}`}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5BC5A7]">
                  Trạng thái của bạn
                </h2>
                <p
                  className={`text-2xl font-[700] ${
                    loading || expensesLoading
                      ? "text-gray-700"
                      : group.netAmount >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {loading || expensesLoading
                    ? "Đang tải..."
                    : group.netAmount === 0
                    ? "Bạn không nợ ai trong nhóm này"
                    : group.netAmount > 0
                    ? `Bạn được nhận: ${group.netAmount.toLocaleString()} ${
                        group.defaultCurrency
                      }`
                    : `Bạn đang nợ: ${Math.abs(group.netAmount).toLocaleString()} ${
                        group.defaultCurrency
                      }`}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiUsers className="mr-2" /> Thành viên
                </h2>
                <a
                  href="#"
                  onClick={() => setIsViewAllModalOpen(true)}
                  className="text-sm text-[#5BC5A7] hover:underline"
                >
                  Xem tất cả
                </a>
              </div>
              <div className="space-y-4">
                {loading
                  ? <p className="text-gray-600 italic text-center">Đang tải...</p>
                  : balances.length > 0
                  ? balances.map((balance) => (
                      <CardFriendEnhanced
                        key={balance.userId}
                        name={balance.userName}
                        debt={balance.amount}
                        isOwed={balance.isOwed}
                        currency={group.defaultCurrency}
                        isLoading={expensesLoading}
                      />
                    ))
                  : <p className="text-gray-600 italic text-center">Chưa có thành viên nào.</p>}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
              >
                <FiUserPlus className="mr-2" /> Thêm thành viên
              </button>
            </div>

            <div className="mt-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiEye className="mr-2" /> Khoản chi gần đây
                </h2>
                <a
                  href="#"
                  onClick={() => setIsViewAllExpensesOpen(true)}
                  className="text-sm text-[#5BC5A7] hover:underline"
                >
                  Xem tất cả
                </a>
              </div>
              {expensesLoading ? (
                <p className="text-gray-600 italic animate-pulse text-center">
                  Đang tải khoản chi...
                </p>
              ) : (
                <div className="space-y-4">
                  {group.expenses.length > 0 ? (
                    group.expenses.map((expense, index) => (
                      <CardExpense
                        key={index}
                        expenseId={expense.expenseId}
                        groupId={expense.groupId}
                        name={expense.name}
                        date={expense.date}
                        amount={expense.amount}
                        currency={group.defaultCurrency}
                        userId={Number(userId)}
                        showDeleteOptions={false}
                        members={group.members}
                        onEditSuccess={fetchExpenses}
                      />
                    ))
                  ) : (
                    <p className="text-gray-600 italic text-center">
                      Chưa có khoản chi nào.
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
              >
                <FiEdit2 className="mr-2" /> Thêm chi tiêu
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>

      <ModalAddMember
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={group.groupId}
        createdBy={group.createdBy}
        onInviteSuccess={handleInviteSuccess}
      />
      <ModalViewAllMembers
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        groupId={group.groupId}
        members={group.members}
        createdBy={group.createdBy}
      />
      <ModalConfirmDelete
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
      />
      <ModalEditGroupInfo
        isOpen={isEditGroupInfoOpen}
        onClose={() => setIsEditGroupInfoOpen(false)}
        group={group}
        onUpdateSuccess={fetchGroupDetails}
      />
      <ModalViewAllExpense
        isOpen={isViewAllExpensesOpen}
        onClose={() => setIsViewAllExpensesOpen(false)}
        expenses={group.expenses}
        groupId={group.groupId}
        userId={Number(userId)}
        currency={group.defaultCurrency}
        members={group.members}
        onDeleteSuccess={handleEditExpenseSuccess}
        onEditSuccess={handleEditExpenseSuccess}
      />
      <ModalAddExpense
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSuccess={handleEditExpenseSuccess}
        userId={Number(userId)}
        groupId={group.groupId}
        members={group.members}
      />
    </>
  );
}