import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Utama Administrator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang di Sistem Pemantauan dan Pelaporan E-Report PBOBA Sumatera Barat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Pemeriksaan Laporan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Modul M5
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Pemeriksaan Laporan Semester
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Pantau tingkat kepatuhan pelaporan semesteran, periksa berkas distribusi, dan tandai laporan yang telah diperiksa.
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Pemeriksaan Laporan →
            </Link>
          </div>

          {/* Card Kelola Akun Reporter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Modul M2
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Kelola Akun Reporter PBOT
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Terbitkan akun baru untuk entitas PBOT, salin format pesan kredensial, dan kelola status aktif akun pelapor.
              </p>
            </div>
            <Link
              href="/admin/reporters"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Buka Kelola Akun →
            </Link>
          </div>

          {/* Card Template Excel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Modul M4
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Template Excel Resmi
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Perbarui berkas template standar Excel (.xlsx) yang diunduh oleh entitas pelapor dengan perlindungan magic bytes.
              </p>
            </div>
            <Link
              href="/admin/template"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Kelola Template →
            </Link>
          </div>

          {/* Card Layanan Tanya Jawab */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Modul M6
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Layanan Tanya Jawab
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Tanggapi kendala teknis dan pertanyaan regulasi pelaporan distribusi langsung dari pihak PBOT.
              </p>
            </div>
            <Link
              href="/admin/questions"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Buka Tanya Jawab →
            </Link>
          </div>

          {/* Card Cadangan Google Drive */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  Modul M7
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Cadangan Google Drive
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Pantau status sinkronisasi salinan arsip ke Google Drive dan pemicuan ulang bila cadangan tertunda.
              </p>
            </div>
            <Link
              href="/admin/backups"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Status Cadangan →
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
