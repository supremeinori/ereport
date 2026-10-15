import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            ADMINISTRATOR
          </span>
          <h1 className="text-lg font-bold text-slate-800">E-Report PBOBA</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Panel Administrator
          </h2>
          <p className="text-sm text-slate-600">
            Selamat datang, <strong className="text-slate-800">{user.name}</strong> ({user.identifier}).
            Autentikasi dan otorisasi role admin berhasil diverifikasi di server.
          </p>
        </div>
      </main>
    </div>
  );
}
