import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Đây là trang chủ của BillShare",
};


export default function Home() {
  return (
    <>
    
      <h1 className="text-[38px] font-[700]">Trang chủ</h1>
    </>
  );
}
