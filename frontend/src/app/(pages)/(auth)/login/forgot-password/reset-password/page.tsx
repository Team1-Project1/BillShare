import { FormResetPassword } from "./FormResetPassword";
import { Suspense } from "react";

const LoadingFallback = () => {
  return (
    <div className="w-full max-w-[576px] mx-auto p-6 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
    </div>
  );
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Bọc component bằng <Suspense> */}
      <Suspense fallback={<LoadingFallback />}>
        <FormResetPassword />
      </Suspense>
    </main>
  );
}