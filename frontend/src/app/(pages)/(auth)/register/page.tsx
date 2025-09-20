import { Metadata } from "next";
import { FormRegister } from "./FormRegister";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Mô tả trang đăng ký của BillShare...",
};

export default function BillShareRegisterPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[576px] mx-auto">
            <FormRegister />
        </div>
      </div>
    </>
  );
}