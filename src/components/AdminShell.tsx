"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-8 9 8M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    name: "Pemeriksaan Laporan",
    href: "/admin/reports",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a2 2 0 011.4.6l5.4 5.4a2 2 0 01.6 1.4V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: "Kelola Akun PBOT",
    href: "/admin/reporters",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11a4 4 0 10-4-4 4 4 0 004 4zm-8 1a3 3 0 10-3-3 3 3 0 003 3zm0 2c-2.3 0-6 1.2-6 3.5V19h12v-2.5C14 14.2 10.3 13 8 13zm8-3a3 3 0 100 6 3 3 0 000-6zm4 9h-2v-2.4c0-1.5-.9-2.9-2.4-3.7A4.8 4.8 0 0120 16c1.7 0 4 .9 4 3.5V21z" />
      </svg>
    ),
  },
  {
    name: "Template Excel Resmi",
    href: "/admin/template",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h10" />
      </svg>
    ),
  },
  {
    name: "Layanan Tanya Jawab",
    href: "/admin/questions",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10.5h8M8 14h5M21 12a9 9 0 11-3.2-6.9M21 4v5h-5" />
      </svg>
    ),
  },
  {
    name: "Cadangan Google Drive",
    href: "/admin/backups",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l4-4m0 0l4 4m-4-4v11" />
      </svg>
    ),
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const navClass = (isActive: boolean) =>
    [
      "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors duration-150",
      isActive
        ? "border-l-purple-600 bg-purple-50 font-semibold text-purple-900"
        : "border-l-transparent text-ink-soft hover:bg-purple-50/60 hover:text-purple-900",
    ].join(" ");

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <header className="sticky top-0 z-40 flex h-14 items-stretch justify-between bg-purple-950 text-white">
        <Link
          href="/admin/dashboard"
          className="flex w-60 shrink-0 items-center gap-2.5 border-r border-white/10 px-5"
        >
          <Image
            src="/ereport_pboba_logo_v2.svg"
            alt="Logo E-Report PBOBA"
            width={30}
            height={30}
            className="h-7 w-7 object-contain"
            priority
          />
          <span className="text-sm font-bold tracking-tight">E-Report PBOBA</span>
        </Link>

        <div className="flex items-center gap-3 pr-4 sm:pr-6">
          <span className="hidden text-xs text-purple-200 md:inline">Administrasi pengawasan wilayah</span>
          <span className="hidden h-4 w-px bg-white/20 md:inline-block" aria-hidden="true" />
          <span className="max-w-[10rem] truncate text-sm font-semibold">{user.name}</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
          <div className="flex items-center gap-3 border-b border-line px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-100 text-sm font-bold text-purple-800">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-soft">Administrator</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <p className="px-3 pb-2 text-2xs font-semibold text-ink-soft">
              Menu
            </p>
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={navClass(isActive)} aria-current={isActive ? "page" : undefined}>
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-line p-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-line-strong px-3 py-2 text-sm font-semibold text-ink-soft transition-colors duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{isLoggingOut ? "Keluar" : "Keluar dari portal"}</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav className="sticky top-14 z-30 flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                    isActive
                      ? "bg-purple-50 font-semibold text-purple-900"
                      : "text-ink-soft hover:bg-purple-50/60 hover:text-purple-900",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

          <footer className="flex flex-col gap-1 border-t border-line bg-surface px-4 py-3 text-2xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 E-Report PBOBA, Sumatera Barat.</p>
            <p className="font-mono">Panel administrator</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
