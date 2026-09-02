import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { getCurrentEmployee } from "@/lib/auth";
import { formsAsPrimary, formsAsSecondary, getFormByEmployee } from "@/lib/store";
import TopNav from "@/components/TopNav";
import Sidebar, { SidebarItem } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "丞石集團績效考核線上化系統（雛形）",
  description: "PRD Phase 1 核心流程可運行雛形 — 僅供內部展示，資料為示範用途",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentEmployee();

  let sidebarItems: SidebarItem[] = [];
  if (user) {
    const myForm = getFormByEmployee(user.id);
    const primaryCount = formsAsPrimary(user.id).length;
    const secondaryCount = formsAsSecondary(user.id).length;
    sidebarItems = [
      { href: "/", label: "首頁總覽", icon: "home", group: "總覽" },
      ...(myForm
        ? [{ href: `/form/${myForm.id}`, label: "我的考核表", icon: "form", group: "我的作業" } as SidebarItem]
        : []),
      ...(primaryCount > 0
        ? [{ href: "/review?role=primary", label: "待我初評", icon: "primary", badge: primaryCount, group: "評核作業" } as SidebarItem]
        : []),
      ...(secondaryCount > 0
        ? [{ href: "/review?role=secondary", label: "待我複評", icon: "secondary", badge: secondaryCount, group: "評核作業" } as SidebarItem]
        : []),
      ...(user.isHrAdmin
        ? [
            { href: "/hr", label: "人資彙整看板", icon: "board", group: "管理" } as SidebarItem,
            { href: "/hr/cycle", label: "考核週期設定", icon: "cycle", group: "管理" } as SidebarItem,
          ]
        : []),
      ...(user.approverCompanyIds?.length
        ? [{ href: "/approve", label: "核決中心", icon: "approve", group: "管理" } as SidebarItem]
        : []),
    ];
  }

  return (
    <html lang="zh-Hant">
      <body>
        <div className="min-h-screen flex flex-col">
          <TopNav user={user} />
          <div className="flex-1 flex w-full items-stretch">
            {user && (
              <Suspense fallback={<div className="hidden lg:block w-64 shrink-0 border-r border-black/5" />}>
                <Sidebar items={sidebarItems} />
              </Suspense>
            )}
            <div className="flex-1 min-w-0 flex flex-col">
              <main className="flex-1 px-4 md:px-8 lg:px-10 py-6">{children}</main>
              <footer className="mt-6 border-t border-black/5 px-4 md:px-8 lg:px-10 py-5 text-center text-xs text-gray-400">
                丞石集團績效考核線上化系統・雛形展示版｜資料為示範用途，非真實員工資料｜伺服器記憶體儲存，重新部署將重置
              </footer>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}