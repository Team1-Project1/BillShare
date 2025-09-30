import CardGroup from "@/components/card/CardGroup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách nhóm",
  description: "Mô tả trang danh sách nhóm...",
};

export default function GroupList() {
  const sampleGroups = [
    { name: "Nhóm A", memberCount: 5 },
    { name: "Nhóm B", memberCount: 8 },
    { name: "Nhóm C", memberCount: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4" style={{ maxWidth: "576px", margin: "0 auto" }}>
      <h1 className="text-2xl font-bold text-[#5BC5A7] mb-6">Danh sách nhóm</h1>
      <div className="space-y-4">
        {sampleGroups.map((group, index) => (
          <CardGroup key={index} name={group.name} memberCount={group.memberCount} />
        ))}
      </div>
    </div>
  );
}