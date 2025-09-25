import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from 'react-toastify'; // Thêm import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Thêm import CSS của react-toastify

export const metadata: Metadata = {
  title: "BillShare",
  description: "Trang web hỗ trợ chia hóa đơn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
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