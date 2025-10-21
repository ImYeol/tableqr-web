import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FCMInitializer } from "@/components/system/FCMInitializer";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TableQR Store",
  description: "모바일에서 감각적으로 매장과 메뉴를 탐색하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-[var(--color-background)]">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}>
        <ToastProvider>
          <FCMInitializer />
          <main className="flex min-h-screen flex-col">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
