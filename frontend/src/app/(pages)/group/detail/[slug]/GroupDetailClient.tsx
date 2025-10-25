"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CardExpense from "@/components/card/CardExpense";
import CardFriendEnhanced from "@/components/card/CardFriendEnhanced";
import CardActivity from "@/components/card/CardActivity";
import { BottomNav } from "@/components/Footer/BottomNav";
import Head from "next/head";
import {
  FiUsers,
  FiMoreVertical,
  FiTrash2,
  FiEdit2,
  FiUserPlus,
  FiEdit,
  FiEye,
  FiDownload,
  FiActivity,
  FiHelpCircle,
  FiChevronDown,
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
import { motion, AnimatePresence } from "framer-motion";

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

interface Activity {
  transactionId: number;
  groupId: number;
  userId: number;
  actionType: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  userName?: string;
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
  const activitiesRef = useRef<HTMLDivElement>(null);

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
  const [isSimplified, setIsSimplified] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const canShowDelete = userId === group.createdBy;
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchGroupDetails = async () => {
    if (!slug || isNaN(Number(slug))) {
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
          toast.error("Phiên đăng nhập hết hạn!", { position: "top-center" });
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
          avatar:
            apiGroup.avatar ||
            "https://res.cloudinary.com/dtpxp9qqf/image/upload/v1750519773/xholultqlsq1bscqj7bv.jpg",
          memberCount: apiGroup.members.length,
          members: apiGroup.members.map((member: APIMember) => ({
            id: member.userId,
            name: member.fullName,
            email: member.email,
            avatar: member.avatarUrl || undefined,
          })),
          createdBy: apiGroup.createdBy,
        }));
        toast.success("Tải chi tiết nhóm thành công!", { position: "top-center" });
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải chi tiết nhóm!", { position: "top-center" });
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!slug || isNaN(Number(slug))) return;
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

      if (!response.ok) throw new Error("Không thể tải các khoản chi");

      const data = await response.json();
      if (data.code === "success" && Array.isArray(data.data)) {
        const mappedExpenses: Expense[] = data.data.map((item: any) => ({
          expenseId: item.expenseId,
          groupId: item.groupId,
          name: item.expenseName,
          date: item.expenseDate,
          amount: item.totalAmount,
          currency: group.defaultCurrency,
        }));

        const totalCost = data.data.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

        setGroup((prev) => ({
          ...prev,
          expenses: mappedExpenses,
          totalCost,
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải các chi tiêu!", { position: "top-center" });
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchBalances = async () => {
    if (!slug || !userId) return;

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

      if (!response.ok) throw new Error("Không thể tải số dư");

      const data = await response.json();
      if (Array.isArray(data.balances)) {
        const mappedBalances: Balances[] = data.balances.map((item: any) => ({
          userId: item.userId,
          userName: item.userName,
          amount: item.amount,
          isOwed: item.isOwed,
        }));

        let netAmount = 0;
        mappedBalances.forEach((b) => {
          netAmount += b.isOwed ? b.amount : -b.amount;
        });

        setGroup((prev) => ({ ...prev, netAmount }));
        setBalances(mappedBalances);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Não thể tải số dư!", { position: "top-center" });
    }
  };

  const fetchActivities = async () => {
    if (!slug || !userId) return;
    setActivitiesLoading(true);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${slug}/transactions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            userId: userId.toString(),
          },
        }
      );

      if (!response.ok) throw new Error("Không thể tải hoạt động");

      const data = await response.json();
      if (data.code === "success" && Array.isArray(data.data)) {
        const mapped: Activity[] = data.data.map((item: any) => ({
          transactionId: item.transactionId,
          groupId: item.groupId,
          userId: item.userId,
          actionType: item.actionType,
          entityType: item.entityType,
          entityId: item.entityId,
          timestamp: item.timestamp,
          userName: group.members.find((m) => m.id === item.userId)?.name || "Người dùng",
        }));
        setActivities(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể tải hoạt động!", { position: "top-center" });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (hasExported) return;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${group.groupId}/export`,
        {
          method: "GET",
          headers: {
            Accept: "text/csv, application/vnd.ms-excel, */*",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Lỗi khi xuất CSV");

      const disposition = response.headers.get("Content-Disposition");
      let filename = `group_${group.groupId}_report.csv`;
      if (disposition?.includes("attachment")) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) filename = match[1].replace(/['"]/g, "");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất CSV thành công!", { position: "top-center" });
      setHasExported(true);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Không thể xuất CSV!", { position: "top-center" });
    }
  };

  const handleSimplifyToggle = async () => {
    const newMode = !isSimplified;
    const groupId = group.groupId;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${groupId}/set-simplify-debt?setSimplifyDebt=${newMode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            userId: userId?.toString() || "",
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Không thể thay đổi chế độ");
      }

      const data = await response.json();
      if (data.code === "success") {
        setIsSimplified(newMode);
        localStorage.setItem(`simplifyMode_${slug}`, JSON.stringify(newMode));
        toast.success(newMode ? "Đã bật đơn giản hóa nợ!" : "Đã tắt đơn giản hóa!", {
          position: "top-center",
        });
        await fetchBalances();
      }
    } catch (err: any) {
      console.error("Toggle simplify error:", err);
      toast.error(err.message || "Lỗi khi thay đổi chế độ đơn giản hóa!", {
        position: "top-center",
      });
    }
  };

  const handleShowActivities = () => {
    if (!showActivities) {
      fetchActivities();
      activitiesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    setShowActivities(!showActivities);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchGroupDetails();
      await fetchExpenses();
    };
    loadData();
  }, [slug]);

  useEffect(() => {
    if (slug && userId) {
      const storedMode = localStorage.getItem(`simplifyMode_${slug}`);
      if (storedMode !== null) {
        setIsSimplified(JSON.parse(storedMode));
      }
      fetchBalances();
    }
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

  const handleInviteSuccess = () => fetchGroupDetails();
  const handleEditExpenseSuccess = () => {
    fetchExpenses();
    fetchBalances();
  };

  const handleDeleteGroup = async (confirmDeleteExpenses: boolean) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/group/${group.groupId}/delete?confirmDeleteWithExpenses=${confirmDeleteExpenses}`,
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
        router.push("/");
      } else {
        const err = await response.json();
        if (!confirmDeleteExpenses && response.status === 500) {
          setIsConfirmDeleteOpen(true);
        } else {
          toast.error(err.message || "Không thể xóa nhóm!", { position: "top-center" });
        }
      }
    } catch (err) {
      toast.error("Không thể xóa nhóm!", { position: "top-center" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  if (loading) return <p className="text-gray-600 text-center">Đang tải...</p>;

  return (
    <>
      <Head>
        <title>Chi tiết nhóm</title>
        <meta name="description" content="Chi tiết nhóm chi tiêu" />
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
            {/* Header nhóm */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src={group.avatar} alt="Avatar nhóm" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h1 className="text-xl font-bold text-[#5BC5A7]">{group.name}</h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiUsers className="mr-1" /> {group.memberCount} thành viên
                  </p>
                  <p className={`text-md text-gray-600 mt-2 line-clamp-2 ${group.description === "Không có mô tả" ? "italic" : ""}`}>
                    Mô tả: {group.description}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {canShowDelete && (
                      <button
                        onClick={() => {
                          handleDeleteGroup(false);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                      >
                        <FiTrash2 className="mr-2" /> Xóa
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditGroupInfoOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                    >
                      <FiEdit className="mr-2" /> Đổi thông tin
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left ${
                        hasExported ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50"
                      }`}
                    >
                      <FiDownload className="mr-2" /> Xuất CSV
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tổng chi phí & trạng thái */}
            <div className="text-center mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">Tổng chi phí</h2>
                <p className="text-2xl font-bold text-gray-700">
                  {expensesLoading ? "Đang tải..." : `${group.totalCost.toLocaleString()} ${group.defaultCurrency}`}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5BC5A7]">Trạng thái của bạn</h2>
                <p
                  className={`text-2xl font-bold ${
                    group.netAmount >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {group.netAmount === 0
                    ? "Bạn không nợ ai"
                    : group.netAmount > 0
                    ? `Bạn được nhận: ${group.netAmount.toLocaleString()} ${group.defaultCurrency}`
                    : `Bạn đang nợ: ${Math.abs(group.netAmount).toLocaleString()} ${group.defaultCurrency}`}
                </p>
              </div>
            </div>

            {/* Thành viên & Toggle Simplify */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiUsers className="mr-2" /> Thành viên
                </h2>
                <button
                  onClick={() => setIsViewAllModalOpen(true)}
                  className="text-sm text-[#5BC5A7] hover:underline"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="flex items-center mb-4">
                <div className="group relative flex items-center">
                  <FiHelpCircle className="text-gray-500 mr-2" size={16} />
                  <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Bật để xem danh sách nợ đơn giản hóa, tắt để xem chi tiết.
                  </span>
                </div>
                <div
                  className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 ${
                    isSimplified ? "bg-[#5BC5A7]" : "bg-gray-300"
                  }`}
                  onClick={handleSimplifyToggle}
                >
                  <motion.div
                    className="absolute w-5 h-5 bg-white rounded-full top-1 left-1 shadow-sm"
                    animate={{ x: isSimplified ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {isSimplified ? "Đơn giản hóa: Bật" : "Đơn giản hóa: Tắt"}
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {balances.length > 0 ? (
                    balances.map((balance) => (
                      <motion.div
                        key={balance.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardFriendEnhanced
                          name={balance.userName}
                          debt={balance.amount}
                          isOwed={balance.isOwed}
                          currency={group.defaultCurrency}
                          isLoading={expensesLoading}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.p className="text-gray-600 italic text-center">
                      Chưa có thành viên nào.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md font-semibold hover:bg-[#4AA88C] transition-colors mt-4 flex items-center justify-center"
              >
                <FiUserPlus className="mr-2" /> Thêm thành viên
              </button>
            </div>

            {/* Khoản chi gần đây */}
            <div className="mt-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiEye className="mr-2" /> Khoản chi gần đây
                </h2>
                <button
                  onClick={() => setIsViewAllExpensesOpen(true)}
                  className="text-sm text-[#5BC5A7] hover:underline"
                >
                  Xem tất cả
                </button>
              </div>

              {expensesLoading ? (
                <p className="text-gray-600 italic text-center animate-pulse">Đang tải...</p>
              ) : group.expenses.length > 0 ? (
                <div className="space-y-4">
                  {group.expenses.map((expense) => (
                    <CardExpense
                      key={expense.expenseId}
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
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic text-center">Chưa có khoản chi nào.</p>
              )}

              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md font-semibold hover:bg-[#4AA88C] transition-colors mt-4 flex items-center justify-center"
              >
                <FiEdit2 className="mr-2" /> Thêm chi tiêu
              </button>

              {/* Hoạt động - CHỈ CÒN 1 NÚT MỞ RỘNG */}
              <div className="mt-6" ref={activitiesRef}>
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center mb-2">
                  <FiActivity className="mr-2" /> Hoạt động gần đây
                </h2>
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleShowActivities}
                    className="flex items-center px-4 py-2 bg-[#E6F4F1] text-[#5BC5A7] rounded-md text-sm font-semibold border border-[#5BC5A7]/50 hover:bg-[#D1E9E3]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span animate={{ rotate: showActivities ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <FiChevronDown className="mr-2" />
                    </motion.span>
                    {showActivities ? "Thu gọn" : "Mở rộng"}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showActivities && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-4 mt-4"
                    >
                      {activitiesLoading ? (
                        <p className="text-gray-600 italic text-center animate-pulse">Đang tải...</p>
                      ) : activities.length > 0 ? (
                        activities.map((activity) => (
                          <CardActivity key={activity.transactionId} activity={activity} />
                        ))
                      ) : (
                        <p className="text-gray-600 italic text-center">Chưa có hoạt động nào.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>

      {/* Modals */}
      <ModalAddMember isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} groupId={group.groupId} createdBy={group.createdBy} onInviteSuccess={handleInviteSuccess} />
      <ModalViewAllMembers isOpen={isViewAllModalOpen} onClose={() => setIsViewAllModalOpen(false)} onDeleteMemberSuccess={fetchGroupDetails} groupId={group.groupId} members={group.members} createdBy={group.createdBy} />
      <ModalConfirmDelete isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} onConfirm={() => handleDeleteGroup(true)} />
      <ModalEditGroupInfo isOpen={isEditGroupInfoOpen} onClose={() => setIsEditGroupInfoOpen(false)} group={group} onUpdateSuccess={fetchGroupDetails} />
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