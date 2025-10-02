"use client";

import { useEffect, useRef } from "react";

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalConfirmDelete({
  isOpen,
  onClose,
  onConfirm,
}: ModalConfirmDeleteProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[400px] shadow-xl border border-gray-200"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0.7)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Xác nhận xóa nhóm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa nhóm chứ? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="h-15 px-4 pb-2 pt-2 bg-gray-500 text-white rounded-md text-base font-semibold hover:bg-gray-600 transition-colors duration-300"
          >
            Không, tôi không muốn
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-15 px-4 pb-2 pt-2 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors duration-300"
          >
            Có, tôi chắc chắn
          </button>
        </div>
      </div>
    </div>
  );
}