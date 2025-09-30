import { FiUsers } from "react-icons/fi";
import Link from "next/link";

interface CardGroupProps {
  name: string;
  memberCount: number;
}

export default function CardGroup({ name, memberCount }: CardGroupProps) {
  return (
    <Link href="/group/detail/1" className="block">
      <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200">
        <div className="flex items-center">
          <FiUsers className="text-[#5BC5A7] mr-2" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">{name}</h4>
            <p className="text-xs text-gray-600">{memberCount} thành viên</p>
          </div>
        </div>
      </div>
    </Link>
  );
}