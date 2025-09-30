"use client";

import { FiUser } from "react-icons/fi";

interface CardMemberSelectProps {
  avatar?: string;
  name: string;
  email: string;
  selected: boolean;
  onSelect: () => void;
}

export default function CardMemberSelect({ avatar, name, email, selected, onSelect }: CardMemberSelectProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Ngăn sự kiện lan truyền lên div cha
    onSelect();
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ gọi onSelect nếu không nhấp vào checkbox
    if (!(e.target instanceof HTMLInputElement)) {
      onSelect();
    }
  };

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between cursor-pointer"
      onClick={handleDivClick}
    >
      <div className="flex items-center">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
        ) : (
          <FiUser className="text-[#5BC5A7] mr-3 text-3xl" />
        )}
        <div>
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <p className="text-xs text-gray-600">{email}</p>
        </div>
      </div>
      <input
        type="checkbox"
        checked={selected}
        onChange={handleCheckboxChange}
        className="w-5 h-5 text-[#5BC5A7] border-gray-300 rounded focus:ring-[#5BC5A7]"
      />
    </div>
  );
}