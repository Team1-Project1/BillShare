"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardFriend from "@/components/card/CardFriend";
import { FiUserPlus } from "react-icons/fi";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Link from "next/link";

interface Section4Props {
  onOpenModal: () => void;
}

interface Friend {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
}

interface PageableResponse {
  content: Friend[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const Section4 = ({ onOpenModal }: Section4Props) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [totalFriends, setTotalFriends] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const page = 0;
  const size = 3;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/users/friends?page=${page}&size=${size}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "*/*",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            return;
          }
          throw new Error("Không thể tải danh sách bạn bè");
        }

        const data = await response.json();
        if (data.code === "error") {
          toast.error(data.message);
          return;
        }

        if (data.code === "success") {
          const pageableData: PageableResponse = data.data;
          setFriends(pageableData.content || []);
          setTotalFriends(pageableData.totalElements);
        }
      } catch (err) {
        console.error("Fetch friends error:", err);
        toast.error("Không thể tải danh sách bạn bè!");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-md rounded-lg max-w-4xl mx-auto w-full">
        <div className="flex justify-center items-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-md rounded-lg max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bạn bè</h3>
        <p className="text-sm text-gray-600">Tổng: {totalFriends}</p>
      </div>

      <div className="space-y-3">
        {friends.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Chưa có bạn bè nào.</p>
        ) : (
          friends.map((friend) => (
            <CardFriend
              key={friend.id}
              name={friend.fullName}
              email={friend.email}
              onUnfriend={() => {
                // Không cho unfriend ở preview
                toast.info("Vui lòng vào trang danh sách bạn bè để hủy kết bạn.");
              }}
            />
          ))
        )}
      </div>

      {/* Nút Xem thêm - chỉ hiện nếu có > 3 bạn */}
      {totalFriends > 3 && (
        <Link href="/friends" className="block mt-4">
          <button className="w-full h-10 bg-gray-200 text-gray-800 rounded-md text-base font-medium hover:bg-gray-300 transition-colors duration-300">
            Xem thêm
          </button>
        </Link>
      )}

      {/* Nút Thêm bạn */}
      <button
        onClick={onOpenModal}
        className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4"
      >
        <FiUserPlus className="mr-2" /> Thêm bạn
      </button>
    </div>
  );
};