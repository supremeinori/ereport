import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  // Ambil data agregat statistik riil dari database
  const [
    totalReports,
    pendingReports,
    approvedReports,
    revisionReports,
    totalReporters,
    totalQuestions,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: ReportStatus.pending_review } }),
    prisma.report.count({ where: { status: ReportStatus.reviewed } }),
    prisma.report.count({ where: { status: ReportStatus.revision_required } }),
    prisma.user.count({ where: { role: Role.reporter } }),
    prisma.question.count(),
  ]);

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        {/* Header Title & Modern Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Dashboard Analitik</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan metrik kepatuhan pelaporan distribusi obat tradisional (PBOT)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 sm:mt-0 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <Link href="/admin/dashboard" className="text-purple-600 hover:text-purple-800 font-bold">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">Dashboard</span>
          </div>
        </div>

        {/* 6 Modern Stat Cards (Purple & Indigo Gradient Palette) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Royal Purple: Total Laporan */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white rounded-2xl shadow-md shadow-purple-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{totalReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-100">
                Total Laporan PBOT
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            {/* More Info Strip */}
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Periksa Laporan</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 2. Deep Violet: Menunggu Review */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-2xl shadow-md shadow-violet-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{pendingReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-violet-100">
                Menunggu Review
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Tinjau Antrean</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 3. Indigo Purple: Laporan Disetujui */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-2xl shadow-md shadow-indigo-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{approvedReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-indigo-100">
                Laporan Disetujui
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Arsip Disetujui</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 4. Purple Slate: Entitas PBOT Terdaftar */}
          <div className="bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 text-white rounded-2xl shadow-md shadow-purple-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{totalReporters}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-200">
                Entitas Pelapor Aktif
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <Link
              href="/admin/reporters"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Kelola Akun PBOT</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 5. Fuchsia Purple: Layanan Tanya Jawab */}
          <div className="bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 text-white rounded-2xl shadow-md shadow-fuchsia-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{totalQuestions}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-fuchsia-100">
                Tanya Jawab / Konsultasi
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <Link
              href="/admin/questions"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Buka Layanan Konsultasi</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 6. Rose Purple: Perlu Perbaikan */}
          <div className="bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800 text-white rounded-2xl shadow-md shadow-rose-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{revisionReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-rose-100">
                Perlu Perbaikan / Revisi
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Pantau Revisi</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );

}
