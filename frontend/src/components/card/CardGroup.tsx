"use client";

import { FiUsers } from "react-icons/fi";
import Link from "next/link";

interface CardGroupProps {
  groupId: number;
  groupName: string;
  description: string;
  defaultCurrency: string;
}

export default function CardGroup({ groupId, groupName, description, defaultCurrency}: CardGroupProps) {
  return (
    <Link href={`/group/detail/${groupId}`} className="block">
      <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200">
        <div className="flex items-center">
          <FiUsers className="text-[#5BC5A7] mr-2" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">{groupName}</h4>
            <p className="text-xs text-gray-600">{description}</p>
            <p className="text-xs text-gray-500">Tiền tệ: {defaultCurrency}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}