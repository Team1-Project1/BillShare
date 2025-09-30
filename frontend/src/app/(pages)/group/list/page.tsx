import { Metadata } from "next"
import GroupList from "./GroupList"
import { BottomNav } from "@/components/Footer/BottomNav"
import { Section1 } from "../../(home)/Section1"

export const metadata: Metadata = {
  title: "Danh sách nhóm",
  description: "Mô tả trang danh sách nhóm...",
}

export default function GroupListPage() {
  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
        <div className="w-full max-w-[576px] mx-auto">
          <Section1 />
          <div className="bg-[#F8F8F8]">
            <GroupList />
          </div>
        </div>
        <BottomNav />
      </div>
      
    </>
  )
}