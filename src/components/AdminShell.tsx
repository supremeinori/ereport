"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface AdminShellProps {
  user: {
    id: string;
    identifier: string;
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: "Pemeriksaan Laporan",
      href: "/admin/reports",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Kelola Akun PBOT",
      href: "/admin/reporters",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      name: "Template Excel Resmi",
      href: "/admin/template",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Layanan Tanya Jawab",
      href: "/admin/questions",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0h-2v2h2V9z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: "Cadangan Google Drive",
      href: "/admin/backups",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#ecf0f5] flex flex-col font-sans">
      {/* Top Navbar Classic AdminLTE Style */}
      <header className="h-12 bg-[#2d7d9a] text-white flex items-center justify-between sticky top-0 z-40 shadow-sm">
        {/* Left Brand Area (Dark Toska Box) - Judul Bersih E-Report PBOBA */}
        <div className="flex items-center">
          <Link
            href="/admin/dashboard"
            className="w-56 h-12 bg-[#0c4a55] hover:bg-[#093d46] text-white font-extrabold text-sm tracking-wider uppercase px-4 flex items-center justify-center transition-colors border-r border-[#093d46]"
          >
            <span>E-Report PBOBA</span>
          </Link>
        </div>

        {/* Right Nav Area: User Info & Sign Out */}
        <div className="flex items-center pr-3 gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/15 text-white text-xs font-semibold rounded-none">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{user.name} ( Admin )</span>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-3 py-1.5 bg-black/20 hover:bg-black/35 text-white text-xs font-bold rounded-none uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? "..." : "Sign out"}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Sidebar Statis Permanen (Tanpa Geser/Tutup) */}
        <aside className="w-56 bg-[#f9fafb] border-r border-slate-300 flex flex-col shrink-0">
          {/* User Profile Box */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-200 bg-white">
            <div className="w-10 h-10 bg-[#0c4a55] text-white flex items-center justify-center font-bold text-sm rounded-none shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-2xs text-slate-500 font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION Header */}
          <div className="px-4 py-2 text-2xs font-bold text-slate-400 uppercase tracking-wider bg-[#f4f6f9] border-b border-slate-200">
            MAIN NAVIGATION
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-1 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-none transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 font-bold border-l-4 border-[#2d7d9a] shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border-l-4 border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-[#2d7d9a]" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="p-3 border-t border-slate-200 bg-[#f4f6f9] text-center">
            <span className="text-3xs text-slate-400 font-mono">E-REPORT PBOBA v1.1</span>
          </div>
        </aside>

        {/* Content Body Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#ecf0f5]">
          <div className="p-4 sm:p-6 flex-1">{children}</div>

          {/* Footer Bar */}
          <footer className="h-11 bg-white border-t border-slate-300 px-6 flex items-center justify-between text-xs text-slate-600">
            <div>
              <strong>Copyright &copy; 2026 <span className="text-[#2d7d9a]">E-Report PBOBA</span>.</strong> All rights reserved.
            </div>
            <div className="hidden sm:block text-2xs text-slate-400">
              Sistem Pelaporan PBOT
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
