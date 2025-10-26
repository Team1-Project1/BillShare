// src/components/modal/ModalConfirmUnfriend.tsx
"use client";

import { useRef, useEffect } from "react";

interface ModalConfirmUnfriendProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friendName: string;
}

export default function ModalConfirmUnfriend({
  isOpen,
  onClose,
  onConfirm,
  friendName,
}: ModalConfirmUnfriendProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className={`
            bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-sm shadow-xl border border-gray-200
            transition-all duration-300 ease-out
            ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          `}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Hủy kết bạn?
          </h3>
          <p className="text-gray-700 mb-6">
            Bạn có chắc chắn muốn hủy kết bạn với <strong>{friendName}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </>
  );
}