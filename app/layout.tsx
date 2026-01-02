import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";

export const metadata: Metadata = {
  title: "Contäx - AI時代の文章のものさし",
  description: "論理を組み立て、伝える力を養う構成支援・文字数カウントツール。PREP法に基づいた文章構成で、レポート作成をサポートします。",
  keywords: ["文字数カウント", "レポート", "PREP法", "文章作成", "AI", "大学生"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Kaisei+Decol&family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@200..900&family=Shippori+Mincho&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </body>
    </html>
  );
}
