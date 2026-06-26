"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, clearToken } from "@/lib/admin-api";
import {
  LayoutDashboard, FileText, FolderGit2, Settings, LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "仪表盘", Icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章管理", Icon: FileText },
  { href: "/admin/projects", label: "项目管理", Icon: FolderGit2 },
  { href: "/admin/site-config", label: "站点配置", Icon: Settings },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/admin/login");
  }, [router]);

  if (!isLoggedIn()) return null;

  const handleLogout = () => {
    clearToken();
    router.replace("/admin/login");
  };

  const Sidebar = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-5 py-5 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold hover:text-indigo-400 transition-colors">
          <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">W</span>
          管理后台
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-1">
          ← 返回前台
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" /> 退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 flex-shrink-0 h-screen sticky top-0">
        {Sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 h-full z-10">{Sidebar}</aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-slate-900 dark:text-white">管理后台</span>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
