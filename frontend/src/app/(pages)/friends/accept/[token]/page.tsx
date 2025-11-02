"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Head from "next/head";

export default function AcceptFriendPage() {
  const router = useRouter();
  const { token } = useParams();

  useEffect(() => {
    const acceptFriend = async () => {
      if (!token) {
        toast.error("Token không hợp lệ");
        setTimeout(() => router.push("/friends"), 3000);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/friendship/accept/${token}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || "Không thể chấp nhận lời mời");
        }

        const data = await response.json();
        toast.success(data.message || "Đã chấp nhận kết bạn!");
      } catch (err: unknown) { // SỬA: từ 'any' thành 'unknown'
        let message = "Lỗi khi chấp nhận lời mời";
        if (err instanceof Error) {
          message = err.message; // SỬA: truy cập message an toàn
        }
        toast.error(message);
      } finally {
        // Redirect sau 5 giây dù thành công hay thất bại
        setTimeout(() => router.push("/friends"), 5000);
      }
    };

    acceptFriend();
  }, [token, router]);

  return (
    <>
      <Head>
        <title>Đồng ý kết bạn</title>
      </Head>
      <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#5BC5A7] mb-3">
            Đã chấp nhận kết bạn!
          </h1>
          <p className="text-gray-700">
            Đang chuyển về danh sách bạn bè sau <strong>5 giây</strong>...
          </p>
        </div>
      </div>
    </>
  );
}