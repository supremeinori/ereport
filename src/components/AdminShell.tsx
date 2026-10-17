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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
      {/* Top Navbar Modern Purple Gradient */}
      <header className="h-14 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white flex items-center justify-between sticky top-0 z-40 shadow-sm border-b border-purple-600/30">
        {/* Left Brand Area */}
        <div className="flex items-center">
          <Link
            href="/admin/dashboard"
            className="w-64 h-14 bg-purple-900/40 hover:bg-purple-900/60 text-white font-extrabold text-sm tracking-wider uppercase px-5 flex items-center gap-2 transition-colors border-r border-purple-700/40"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 text-purple-950 font-black text-xs flex items-center justify-center shadow-xs">
              PB
            </span>
            <span>E-Report PBOBA</span>
          </Link>
        </div>

        {/* Clean Right Navbar Area */}
        <div className="flex items-center pr-6 gap-3">
          <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-purple-100 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Panel Administrator Pengawasan Wilayah Sumatera Barat
          </span>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Modern Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
          {/* User Profile Box di Sidebar */}
          <div className="p-4 flex items-center gap-3 border-b border-purple-100/60 bg-gradient-to-r from-purple-50/60 to-indigo-50/30">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm rounded-xl shrink-0 shadow-sm shadow-purple-500/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-2xs text-purple-700 font-semibold">Administrator</span>
              </div>
            </div>
          </div>

          {/* MAIN NAVIGATION Header */}
          <div className="px-5 pt-4 pb-2 text-2xs font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-sm shadow-purple-500/25"
                      : "text-slate-600 hover:bg-purple-50/80 hover:text-purple-700"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-purple-600"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Sidebar: Tombol Logout & Info Versi */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{isLoggingOut ? "Keluar..." : "Keluar (Logout)"}</span>
            </button>
            <div className="text-center">
              <span className="text-3xs text-slate-400 font-mono">E-REPORT PBOBA v1.1</span>
            </div>
          </div>
        </aside>

        {/* Content Body Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f8f9fc]">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>

          {/* Footer Bar */}
          <footer className="h-12 bg-white border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500">
            <div>
              <strong>Copyright &copy; 2026 <span className="text-purple-600 font-bold">E-Report PBOBA</span>.</strong> All rights reserved.
            </div>
            <div className="hidden sm:block text-2xs text-slate-400">
              Sistem Pelaporan Distribusi Obat Tradisional
            </div>
          </footer>
        </main>
      </div>
    </div>
  );

}
