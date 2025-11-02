import { Suspense } from "react";
import DeclineClient from "./DeclineClient";

// Component loading
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BC5A7]"></div>
  </div>
);

export default function DeclinePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeclineClient />
    </Suspense>
  );
}