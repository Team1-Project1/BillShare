"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Section1 } from "@/app/(pages)/(home)/Section1";
import CardBill from "@/components/card/CardBill";
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
  FiEye,
  FiUserPlus,
  FiEdit,
} from "react-icons/fi";
import ModalAddMember from "@/components/modal/ModalAddMember";
import ModalViewAllMembers from "@/components/modal/ModalViewAllMembers";
import ModalConfirmDelete from "@/components/modal/ModalConfirmDelete";
import ModalEditGroupInfo from "@/components/modal/ModalEditGroupInfo";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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


interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  debt: number;
  received: number;
}

interface Group {
  groupId: number;
  name: string;
  description: string;
  defaultCurrency: string;
  avatar: string;
  memberCount: number;
  totalCost: number;
  costPerPerson: number;
  members: Member[];
  bills: { name: string; date: string; amount: number }[];
  createdBy: number;
}

export default function GroupDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const userId = Number(localStorage.getItem("userId"));
  

  const [group, setGroup] = useState<Group>({
    groupId: 0,
    name: "Nhóm A",
    description: "Không có mô tả",
    defaultCurrency: "VND",
    avatar:
      "https://res.cloudinary.com/dtpxp9qqf/image/upload/v1750519773/xholultqlsq1bscqj7bv.jpg",
    memberCount: 5,
    totalCost: 5000000,
    costPerPerson: 1000000,
    members: [
      {
        id: 1,
        name: "Thành viên 1",
        email: "member1@example.com",
        avatar: undefined,
        debt: 0,
        received: 0,
      },
      {
        id: 2,
        name: "Thành viên 2",
        email: "member2@example.com",
        avatar: undefined,
        debt: 0,
        received: 0,
      },
    ],
    bills: [
      { name: "Hóa đơn ăn uống", date: "2025-09-28", amount: 2000000 },
      { name: "Hóa đơn du lịch", date: "2025-09-25", amount: 3000000 },
    ],
    createdBy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditGroupInfoOpen, setIsEditGroupInfoOpen] = useState(false);
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
      console.log("API response:", data);
      if (data.code === "error") {
        toast.error(data.message, { position: "top-center" });
        return;
      }

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
          totalCost: 5000000,
          costPerPerson: 1000000,
          members: apiGroup.members.map((member: APIMember) => ({
            id: member.userId,
            name: member.fullName,
            email: member.email,
            avatar: member.avatarUrl || undefined,
            debt: 0,
            received: 0,
          })),
          bills: [
            {
              name: "Hóa đơn ăn uống",
              date: "2025-09-28",
              amount: 2000000,
            },
            {
              name: "Hóa đơn du lịch",
              date: "2025-09-25",
              amount: 3000000,
            },
          ],
          createdBy: apiGroup.createdBy,
        });
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

  useEffect(() => {
    fetchGroupDetails();
  }, [slug]);

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
    fetchGroupDetails(); // Reload danh sách thành viên
  };

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
        toast.error(errorData.message || "Không thể xóa nhóm!", { position: "top-center" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Không thể xóa nhóm!", { position: "top-center" });
      setLoading(false);
    } finally {
      setLoading(false);
    } 
  };

  const canShowDelete = userId === group.createdBy; // Chỉ người tạo nhóm mới có quyền xóa nhóm

  if (loading) return <p className="text-gray-600">Đang tải...</p>;

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
            isModalOpen || isViewAllModalOpen || isConfirmDeleteOpen
              ? "blur(5px) brightness(0.8)"
              : "none",
          transition: "filter 0.3s",
        }}
      >
        <div className="w-full max-w-[576px] mx-auto">
          <Section1 />
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            {/* Header */}
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
                    <FiUsers className="mr-1" /> {group.memberCount} thành viên
                  </p>
                  <p
                    className={`text-md text-gray-600 mt-2 line-clamp-2 ${
                      group.description === "Không có mô tả" ? "italic" : ""
                    }`}
                  >
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
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {canShowDelete && (<button
                      onClick={() => {
                        setIsConfirmDeleteOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-[rgba(227,76,76,0.2)] w-full text-left"
                    >
                      <FiTrash2 className="mr-2" /> Xóa
                    </button>)}
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiImage className="mr-2" /> Đổi ảnh
                    </a>
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

            {/* Cost */}
            <div className="flex items-center justify-between text-gray-700 mb-6">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">
                  Tổng chi phí
                </h2>
                <p className="text-2xl font-extrabold">
                  {group.totalCost.toLocaleString()} {group.defaultCurrency}
                </p>
              </div>
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">
                  Số tiền/Người
                </h2>
                <p className="text-2xl font-extrabold">
                  {group.costPerPerson.toLocaleString()} {group.defaultCurrency}
                </p>
              </div>
            </div>

            {/* Members */}
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
                {group.members.map((member) => (
                  <CardFriendEnhanced
                    key={member.id}
                    name={member.name}
                    debt={member.debt}
                    received={member.received}
                  />
                ))}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
              >
                <FiUserPlus className="mr-2" /> Thêm thành viên
              </button>
            </div>

            {/* Bills */}
            <div className="mt-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiEye className="mr-2" /> Hóa đơn gần đây
                </h2>
                <a href="#" className="text-sm text-[#5BC5A7] hover:underline">
                  Xem tất cả
                </a>
              </div>
              <div className="space-y-4">
                {group.bills.map((bill, index) => (
                  <CardBill
                    key={index}
                    name={bill.name}
                    date={bill.date}
                    amount={bill.amount}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>

      {/* Modals */}
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
    </>
  );
}