import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminNavbar from "@/components/AdminNavbar";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar user={user} currentPath="/admin/dashboard" />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang di Sistem Pemantauan dan Pelaporan E-Report PBOBA Sumatera Barat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Manajemen Akun Reporter
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Modul M2
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Kelola entitas Pedagang Besar Obat Tradisional (PBOT), buat akun pelapor baru, lakukan pencarian data, serta aktifkan atau nonaktifkan akun pelapor.
            </p>
            <Link
              href="/admin/reporters"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Kelola Akun Reporter →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Pemeriksaan Laporan Semester
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                Modul M5 (Akan Datang)
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pemantauan ringkasan laporan masuk, filter periode tahun & semester, pemeriksaan berkas, dan verifikasi status review.
            </p>
            <button
              disabled
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 bg-slate-100 cursor-not-allowed"
            >
              Segera Hadir di Tahap Berikutnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
