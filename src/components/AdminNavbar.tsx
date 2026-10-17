import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface AdminNavbarProps {
  user: {
    name: string;
    email: string;
    identifier: string;
  };
  currentPath?: string;
}

export default function AdminNavbar({ user, currentPath }: AdminNavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20">
                ADMIN
              </span>
              <span className="font-bold text-slate-900 tracking-tight">
                E-Report PBOBA
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/dashboard"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/reporters"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/reporters"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Kelola Akun Reporter
              </Link>
              <Link
                href="/admin/reports"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/reports"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Pemeriksaan Laporan
              </Link>
              <Link
                href="/admin/template"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/template"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Template Excel
              </Link>
              <Link
                href="/admin/questions"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/questions"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Tanya Jawab
              </Link>
              <Link
                href="/admin/backups"
                className={`px-3 py-2 rounded-xl font-medium transition-colors ${
                  currentPath === "/admin/backups"
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                Cadangan Drive
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
