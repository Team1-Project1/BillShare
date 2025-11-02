"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Head from "next/head";

export default function DeclineFriendPage() {
  const router = useRouter();
  const { token } = useParams();

  useEffect(() => {
    const declineFriend = async () => {
      if (!token) {
        toast.error("Token không hợp lệ");
        setTimeout(() => router.push("/friends"), 3000);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/friendship/decline/${token}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || "Không thể từ chối lời mời");
        }

        const data = await response.json();
        toast.success(data.message || "Đã từ chối lời mời kết bạn");
      } catch (err: unknown) { // SỬA: từ 'any' thành 'unknown'
        let message = "Lỗi khi từ chối";
        if (err instanceof Error) {
          message = err.message; // SỬA: truy cập message an toàn
        }
        toast.error(message);
      } finally {
        setTimeout(() => router.push("/friends"), 5000);
      }
    };

    declineFriend();
  }, [token, router]);

  return (
    <>
      <Head>
        <title>Từ chối kết bạn</title>
      </Head>
      <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-3">
            Đã từ chối lời mời
          </h1>
          <p className="text-gray-700">
            Đang chuyển về danh sách bạn bè sau <strong>5 giây</strong>...
          </p>
        </div>
      </div>
    </>
  );
}