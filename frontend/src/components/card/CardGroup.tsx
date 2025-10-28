"use client";

import { FiUsers } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

interface CardGroupProps {
  groupId: number;
  groupName: string;
  description: string;
  defaultCurrency: string;
  avatarUrl?: string;
}

export default function CardGroup({ groupId, groupName, description, defaultCurrency, avatarUrl }: CardGroupProps) {
  return (
    <Link href={`/group/detail/${groupId}`} className="block">
      <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={groupName}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
          ) : (
            <FiUsers className="text-[#5BC5A7] mr-2 text-2xl" />
          )}
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