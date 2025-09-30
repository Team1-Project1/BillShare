import { FiUser } from "react-icons/fi";

interface CardFriendProps {
  name: string;
  status: string;
}

export default function CardFriend({ name, status }: CardFriendProps) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200">
      <div className="flex items-center">
        <FiUser className="text-[#5BC5A7] mr-2" />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <p className="text-xs text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}