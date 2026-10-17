import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ReporterShell from "@/components/ReporterShell";
import Link from "next/link";
import Image from "next/image";

export default async function ReporterDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  // Ambil data agregat laporan reporter
  const [
    myTotalReports,
    myPendingReports,
    myApprovedReports,
    myRevisionReports,
    myQuestionsCount,
  ] = await Promise.all([
    prisma.report.count({ where: { user_id: user.id } }),
    prisma.report.count({ where: { user_id: user.id, status: ReportStatus.pending_review } }),
    prisma.report.count({ where: { user_id: user.id, status: ReportStatus.reviewed } }),
    prisma.report.count({ where: { user_id: user.id, status: ReportStatus.revision_required } }),
    prisma.question.count({ where: { user_id: user.id } }),
  ]);

  return (
    <ReporterShell user={user}>
      <div className="space-y-6">
        {/* Header Title & Modern Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Image
                src="/ereport_pboba_logo_v2.svg"
                alt="Logo E-Report PBOBA"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-contain shrink-0"
              />
              <span>Dashboard Pelapor</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                PBOT
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Status pengunggahan dan riwayat kepatuhan laporan semester distribusi obat tradisional
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 sm:mt-0 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <Link href="/reporter/dashboard" className="text-purple-600 hover:text-purple-800 font-bold">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">Dashboard</span>
          </div>
        </div>

        {/* 4 Modern Stat Cards (Purple & Violet Gradient Palette) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Mauve Purple: Total Laporan */}
          <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{myTotalReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-200">
                Total Laporan Saya
              </p>
            </div>
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Riwayat Lengkap</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 2. Dusty Violet: Menunggu Review */}
          <div className="bg-gradient-to-br from-purple-800 via-indigo-800 to-indigo-950 text-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{myPendingReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-200">
                Menunggu Review
              </p>
            </div>
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Status Review</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 3. Slate Lilac: Laporan Disetujui */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{myApprovedReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-indigo-200">
                Laporan Disetujui
              </p>
            </div>
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Laporan Sah</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* 4. Muted Plum / Dusty Wine: Perlu Perbaikan */}
          <div className="bg-gradient-to-br from-[#754e6b] via-[#5d3b53] to-purple-950 text-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="p-5 relative z-10">
              <div className="text-4xl font-black tracking-tight">{myRevisionReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-200">
                Perlu Perbaikan
              </p>
            </div>
            <div className="absolute right-4 top-4 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 backdrop-blur-xs text-white/95 text-xs py-2 px-5 text-center font-bold flex items-center justify-between transition-colors border-t border-white/10"
            >
              <span>Perbaiki Laporan</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>
        </div>

        {/* Action Panel Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center font-bold rounded-xl text-lg shadow-xs">
                  📥
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Unggah Laporan Semester Baru
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Kirimkan berkas laporan distribusi obat tradisional semesteran resmi menggunakan format Excel (.xlsx) standar E-Report PBOBA.
              </p>
            </div>
            <div>
              <Link
                href="/reporter/reports"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-sm shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Buka Formulir Pelaporan</span>
                <span>➔</span>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center font-bold rounded-xl text-lg shadow-xs">
                  💬
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Layanan Tanya Jawab ({myQuestionsCount} Tiket)
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Memiliki kendala regulasi atau pertanyaan seputar pengisian format template? Ajukan tiket pertanyaan langsung ke tim verifikator E-Report PBOBA.
              </p>
            </div>
            <div>
              <Link
                href="/reporter/questions"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Buka Layanan Tanya Jawab</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ReporterShell>
  );

}
