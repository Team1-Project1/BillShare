"use client";

import { useState, useEffect } from "react";
import { FiUserPlus } from "react-icons/fi";
import CardFriend from "@/components/card/CardFriend";
import ModalAddFriend from "@/components/modal/ModalAddFriend";
import ModalConfirmUnfriend from "@/components/modal/ModalConfirmUnfriend";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import { BottomNav } from "@/components/Footer/BottomNav";

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

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [totalFriends, setTotalFriends] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const size = 10;

  const fetchFriends = async (page: number) => {
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
        const newFriends = pageableData.content || [];

        setFriends((prev) => [...prev, ...newFriends]);
        setTotalFriends(pageableData.totalElements);
        setHasMore(!pageableData.last);
      }
    } catch (err) {
      console.error("Fetch friends error:", err);
      toast.error("Lỗi khi tải danh sách bạn bè");
    } finally {
      if (page === 0) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends(0);
  }, []);

  const loadMore = () => {
    if (!hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchFriends(nextPage);
  };

  const openConfirmModal = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsConfirmOpen(true);
  };

  const handleUnfriend = async () => {
    if (!selectedFriend) return;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/users/delete/${selectedFriend.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Không thể hủy kết bạn");
      }

      toast.success(`Đã hủy kết bạn với ${selectedFriend.fullName}`);
      setFriends((prev) => prev.filter((f) => f.id !== selectedFriend.id));
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi hủy kết bạn");
    } finally {
      setIsConfirmOpen(false);
      setSelectedFriend(null);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
        style={{
          filter: isModalOpen || isConfirmOpen ? "blur(5px) brightness(0.8)" : "none",
          transition: "filter 0.3s ease-out",
          pointerEvents: isModalOpen || isConfirmOpen ? "none" : "auto",
        }}
      >
        <div className="w-full max-w-[576px] mx-auto" style={{ pointerEvents: "auto" }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#5BC5A7]">Danh sách bạn bè</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5BC5A7] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4AA88C] transition-colors"
            >
              <FiUserPlus size={20} />
              Thêm bạn
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-600">Bạn chưa có bạn bè nào.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-[#5BC5A7] font-medium hover:underline"
              >
                Mời bạn bè ngay!
              </button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={friends.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center items-center my-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5BC5A7]"></div>
                </div>
              }
              endMessage={
                <p className="text-center text-gray-600 mt-6">Đã tải hết danh sách bạn bè.</p>
              }
            >
              <div className="space-y-3">
                {friends.map((friend) => (
                  <CardFriend
                    key={friend.id}
                    name={friend.fullName}
                    email={friend.email}
                    onUnfriend={() => openConfirmModal(friend)}
                  />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>

        <BottomNav />
      </div>

      <ModalAddFriend
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setFriends([]);
          setCurrentPage(0);
          setHasMore(true);
          fetchFriends(0);
        }}
      />

      {selectedFriend && (
        <ModalConfirmUnfriend
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleUnfriend}
          friendName={selectedFriend.fullName}
        />
      )}
    </>
  );
}