"use client";
import "./globals.css";
import { ToastContainer } from 'react-toastify'; // Thêm import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Thêm import CSS của react-toastify
import { useAuthRefresh } from "@/hooks/useAuthRefresh";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuthRefresh(); // luôn chạy background refresh

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>BillShare</title>
      </head>
      <body>
        {children}
        <ToastContainer 
          position="top-right"
          autoClose={3000} // Tự động đóng sau 3 giây
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </body>
    </html>
  );
}