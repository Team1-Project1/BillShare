import { Metadata } from "next";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Mô tả trang đăng nhập của BillShare...",
};

export default function BillShareLoginPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[576px] mx-auto">
          <FormLogin />
        </div>
      </div>
    </>
  );
}