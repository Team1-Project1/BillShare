import type { Metadata } from "next";
import "./globals.css";


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

      </body>
    </html>
    
  );
}
