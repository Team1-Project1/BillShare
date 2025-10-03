"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Head from "next/head";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const confirmJoin = async () => {
      if (!groupId || !userId) {
        toast.error("Thông tin không hợp lệ!", { position: "top-center" });
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/group-member/${groupId}/confirm/${userId}`,
          {
            method: "GET", // Sửa từ PUT thành GET
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể xác nhận tham gia nhóm");
        }

        const data = await response.json();
        if (data.code === "success") {
          toast.success(data.message, { position: "top-center" });
        } else {
          toast.error(data.message, { position: "top-center" });
        }
      } catch (err) {
        console.error("Confirm join error:", err);
        toast.error("Không thể xác nhận tham gia nhóm!", { position: "top-center" });
      }

      // Chuyển hướng sau 3 giây
      setTimeout(() => router.push(`/group/detail/${groupId}`), 3000);
    };

    confirmJoin();
  }, [groupId, userId, router]);

  return (
    <>
      <Head>
        <title>Cảm ơn bạn đã tham gia</title>
        <meta name="description" content="Cảm ơn bạn đã tham gia nhóm!" />
      </Head>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-center p-4 pb-20"
      >
        <div className="w-full max-w-[576px] mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#5BC5A7] mb-4">
            Cảm ơn bạn đã tham gia nhóm!
          </h1>
          <p className="text-lg text-gray-700">
            Bạn sẽ được chuyển hướng về trang chính trong vài giây...
          </p>
        </div>
      </div>
    </>
  );
}