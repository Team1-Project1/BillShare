import Head from "next/head";
import { BottomNav } from "@/components/Footer/BottomNav";
import AccountDetailPage from "./AccountDetail";

export default function AccountPage() {
  return (
    <>
      <Head>
        <title>Trang tài khoản</title>
        <meta name="description" content="Mô tả trang tài khoản..." />
      </Head>
      <div
        className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20"
      > 
        <div className="w-full max-w-[576px] mx-auto"> 
          <AccountDetailPage/>
        </div>
        <BottomNav />
      </div> 
    </>
  );
}