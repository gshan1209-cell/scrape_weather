import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "農事天氣儀表板",
  description: "CWA 天氣與農事提醒儀表板",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
