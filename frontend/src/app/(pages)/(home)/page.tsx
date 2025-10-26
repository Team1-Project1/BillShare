"use client";

import { useState } from "react";
import Head from "next/head";
import { Section1 } from "./Section1";
import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";
import { BottomNav } from "@/components/Footer/BottomNav";
import ModalCreateGroup from "@/components/modal/ModalCreateGroup";
import ModalAddFriend from "@/components/modal/ModalAddFriend";

export default function Home() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);

  const handleOpenGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  const handleOpenFriendModal = () => {
    setIsFriendModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Trang chủ</title>
        <meta name="description" content="Mô tả trang chủ..." />
      </Head>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
        style={{
          filter: isGroupModalOpen || isFriendModalOpen ? "blur(5px) brightness(0.8)" : "none",
          transition: "filter 0.3s",
        }}
      >
        <div className="w-full max-w-[576px] mx-auto">
          <Section1 />
          <div className="bg-[#F8F8F8]">
            <div className="py-6">
              <Section2 />
              <hr className="my-6 border-gray-400" />
              <Section3 onOpenModal={handleOpenGroupModal} />
              <hr className="my-6 border-gray-400" />
              <Section4 onOpenModal={handleOpenFriendModal} />
              <hr className="my-6 border-gray-400" />
              <Section5 />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
      <ModalCreateGroup isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <ModalAddFriend isOpen={isFriendModalOpen} onClose={() => setIsFriendModalOpen(false)} onSuccess={() => {console.log("Thêm bạn thành công!");}} />
    </>
  );
}