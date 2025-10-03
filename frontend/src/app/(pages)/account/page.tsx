"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import ModalConfirmLogout from "@/components/modal/ModalConfirmLogout";

export default function AccountPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Trang tài khoản</title>
        <meta name="description" content="Mô tả trang tài khoản..." />
      </Head>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
        
      >
        <div className="w-full max-w-[576px] mx-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full max-w-[200px] h-12 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center mx-auto mt-4"
          >
            Đăng xuất
          </button>
          <ModalConfirmLogout
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleLogout}
          />
        </div>
      </div>
    </>
  );
}