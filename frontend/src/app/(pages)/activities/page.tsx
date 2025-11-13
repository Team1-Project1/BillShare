// src/app/(pages)/activities/page.tsx
import Head from "next/head";
import { BottomNav } from "@/components/Footer/BottomNav";
import ActivitiesClient from "./ActivitiesClient";
import { Suspense } from "react";

// Tạo Skeleton UI
function ActivitiesSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <>
      <Head>
        <title>Trang hoạt động</title>
        <meta name="description" content="Xem tất cả hoạt động trong nhóm" />
      </Head>
      <div className="min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20">
        <div className="w-full max-w-[576px] mx-auto">
          {/* Bọc trong Suspense */}
          <Suspense fallback={<ActivitiesSkeleton />}>
            <ActivitiesClient />
          </Suspense>
        </div>
        <BottomNav />
      </div>
    </>
  );
}