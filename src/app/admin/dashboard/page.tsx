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
                Template &amp; Unduh Aman
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Modul M4
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Kelola template Excel resmi untuk diunduh pelapor, serta pastikan setiap unduhan menggunakan tautan bertanda waktu (signed URL) yang aman.
            </p>
            <Link
              href="/admin/template"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Kelola Template →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Pemeriksaan Laporan Semester
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Modul M5
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pantau kepatuhan penyerahan laporan PBOT, periksa berkas distribusi per semester, dan beri tanda verifikasi laporan.
            </p>
            <Link
              href="/admin/reports"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Pemeriksaan Laporan →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Layanan Tanya Jawab
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Modul M6
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Tanggapi pertanyaan kendala pelaporan dari entitas PBOT, berikan asistensi teknis, dan kelola arsip tanya jawab.
            </p>
            <Link
              href="/admin/questions"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Tanya Jawab →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Cadangan Google Drive
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Modul M7
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pantau status sinkronisasi salinan cadangan laporan ke Google Drive dan lakukan percobaan ulang (retry) bila diperlukan.
            </p>
            <Link
              href="/admin/backups"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Status Cadangan →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
