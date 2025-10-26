"use client";

import { useState, useEffect } from "react";
import { FiUserPlus } from "react-icons/fi";
import CardFriend from "@/components/card/CardFriend";
import ModalAddFriend from "@/components/modal/ModalAddFriend";
import ModalConfirmUnfriend from "@/components/modal/ModalConfirmUnfriend";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import Head from "next/head";
import { BottomNav } from "@/components/Footer/BottomNav";

interface Friend {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/users/friends?page=0&size=10`
      );
      if (!response.ok) throw new Error("Không thể tải danh sách bạn bè");
      const data = await response.json();
      setFriends(data.data?.content || []);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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
      fetchFriends();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi hủy kết bạn");
    } finally {
      setIsConfirmOpen(false);
      setSelectedFriend(null);
    }
  };

  return (
    <>
      <Head>
        <title>Danh sách bạn bè</title>
        <meta name="description" content="Quản lý bạn bè của bạn" />
      </Head>

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
          )}
        </div>

        <BottomNav />
      </div>

      <ModalAddFriend
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFriends}
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