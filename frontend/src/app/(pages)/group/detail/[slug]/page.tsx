"use client";

import { Section1 } from "@/app/(pages)/(home)/Section1";
import CardBill from "@/components/card/CardBill";
import CardFriendEnhanced from "@/components/card/CardFriendEnhanced";
import { BottomNav } from "@/components/Footer/BottomNav";
import Head from "next/head";
import { FiUsers, FiMoreVertical, FiTrash2, FiEdit2, FiImage, FiDownload, FiEye, FiUserPlus } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import ModalAddMember from "@/components/modal/ModalAddMember";
import ModalViewAllMembers from "@/components/modal/ModalViewAllMembers";

export default function GroupDetailPage({ params }: { params: { slug: string } }) {
  const group = {
    avatar: "https://res.cloudinary.com/dtpxp9qqf/image/upload/v1750519773/xholultqlsq1bscqj7bv.jpg",
    name: "Nhóm A",
    memberCount: 5,
    totalCost: 5000000,
    costPerPerson: 1000000,
    members: [
      { id: 1, name: "Thành viên 1", email: "member1@example.com", debt: 200000, received: 150000 },
      { id: 2, name: "Thành viên 2", email: "member2@example.com", debt: 0, received: 300000 },
    ],
    bills: [
      { name: "Hóa đơn ăn uống", date: "2025-09-28", amount: 2000000 },
      { name: "Hóa đơn du lịch", date: "2025-09-25", amount: 3000000 },
    ],
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false); // State cho modal mới
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenViewAllModal = () => {
    setIsViewAllModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Chi tiết nhóm</title>
        <meta name="description" content="Mô tả trang chi tiết nhóm..." />
      </Head>
      <div 
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
        style={{
          filter: isModalOpen || isViewAllModalOpen ? "blur(5px) brightness(0.8)" : "none",
          transition: "filter 0.3s",
        }}
      >
        <div className="w-full max-w-[576px] mx-auto">
          <Section1 />
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src={group.avatar} alt="Avatar nhóm" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h1 className="text-xl font-bold text-[#5BC5A7]">{group.name}</h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiUsers className="mr-1" /> {group.memberCount} thành viên
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
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiTrash2 className="mr-2" /> Xóa
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiEdit2 className="mr-2" /> Đổi tên
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(91,197,167,0.2)]"
                    >
                      <FiImage className="mr-2" /> Đổi ảnh
                    </a>
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
            <div className="flex items-center justify-between text-gray-700 mb-6">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">Tổng chi phí</h2>
                <p className="text-2xl font-extrabold">{group.totalCost.toLocaleString()} đ</p>
              </div>
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-[#5BC5A7]">Số tiền/Người</h2>
                <p className="text-2xl font-extrabold">{group.costPerPerson.toLocaleString()} đ</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiUsers className="mr-2" /> Thành viên
                </h2>
                <a
                  href="#"
                  onClick={handleOpenViewAllModal}
                  className="text-sm text-[#5BC5A7] hover:underline"
                >
                  Xem tất cả
                </a>
              </div>
              <div className="space-y-4">
                {group.members.map((member, index) => (
                  <CardFriendEnhanced
                    key={index}
                    name={member.name}
                    debt={member.debt}
                    received={member.received}
                  />
                ))}
              </div>
              <button
                onClick={handleOpenModal}
                className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
              >
                <FiUserPlus className="mr-2" /> Thêm thành viên
              </button>
            </div>
            <div className="mt-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#5BC5A7] flex items-center">
                  <FiEye className="mr-2" /> Hóa đơn gần đây
                </h2>
                <a href="#" className="text-sm text-[#5BC5A7] hover:underline">Xem tất cả</a>
              </div>
              <div className="space-y-4">
                {group.bills.map((bill, index) => (
                  <CardBill key={index} name={bill.name} date={bill.date} amount={bill.amount} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
      <ModalAddMember isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ModalViewAllMembers
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        members={group.members}
      />
    </>
  );
}