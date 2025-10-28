import Head from "next/head";
import { BottomNav } from "@/components/Footer/BottomNav";
import ActivitiesList from "./ActivitiesList";

export default function ActivitiesPage() {
  return (
    <>
      <Head>
        <title>Trang hoạt động</title>
        <meta name="description" content="Xem tất cả hoạt động trong nhóm" />
      </Head>
      <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
        <div className="w-full max-w-[576px] mx-auto">
          <ActivitiesList />
        </div>
        <BottomNav />
      </div>
    </>
  );
}