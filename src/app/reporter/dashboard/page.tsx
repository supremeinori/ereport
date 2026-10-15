import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ReporterShell from "@/components/ReporterShell";
import Link from "next/link";

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
      <div className="space-y-5">
        {/* Header Title & Breadcrumb Sesuai Screenshot AdminLTE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-300">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="text-xs text-slate-500 font-normal">
              Control panel
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 sm:mt-0 font-medium">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <Link href="/reporter/dashboard" className="text-slate-700 hover:text-slate-900 font-bold">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-400">Dashboard</span>
          </div>
        </div>

        {/* 4 Kotak Statistik Tegas AdminLTE (Small Boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Aqua/Cyan: Total Laporan Terunggah */}
          <div className="bg-[#00c0ef] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{myTotalReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Total Laporan Saya
              </p>
            </div>
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 2. Dark Blue: Menunggu Review */}
          <div className="bg-[#0073b7] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{myPendingReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Menunggu Review
              </p>
            </div>
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 3. Green: Laporan Disetujui */}
          <div className="bg-[#00a65a] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{myApprovedReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Laporan Disetujui
              </p>
            </div>
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 4. Crimson Red: Perlu Revisi */}
          <div className="bg-[#dd4b39] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{myRevisionReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Perlu Perbaikan
              </p>
            </div>
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <Link
              href="/reporter/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>
        </div>

        {/* Action Panel Kotak Putih Tegas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white border border-slate-300 rounded-none shadow-xs p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#2d7d9a] text-white flex items-center justify-center font-bold rounded-none">
                📥
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Unggah Laporan Semester Baru
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Kirimkan berkas laporan distribusi obat tradisional semesteran resmi menggunakan format Excel (.xlsx) standar E-Report PBOBA.
            </p>
            <Link
              href="/reporter/reports"
              className="inline-flex items-center gap-2 bg-[#2d7d9a] hover:bg-[#236881] text-white text-xs font-bold py-2.5 px-4 rounded-none uppercase tracking-wider transition-colors"
            >
              <span>Buka Formulir Pelaporan</span>
              <span>➔</span>
            </Link>
          </div>

          <div className="bg-white border border-slate-300 rounded-none shadow-xs p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#605ca8] text-white flex items-center justify-center font-bold rounded-none">
                💬
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Layanan Tanya Jawab ({myQuestionsCount} Tiket)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Memiliki kendala regulasi atau pertanyaan seputar pengisian format template? Ajukan tiket pertanyaan langsung ke tim verifikator E-Report PBOBA.
            </p>
            <Link
              href="/reporter/questions"
              className="inline-flex items-center gap-2 bg-[#605ca8] hover:bg-[#504c92] text-white text-xs font-bold py-2.5 px-4 rounded-none uppercase tracking-wider transition-colors"
            >
              <span>Buka Layanan Tanya Jawab</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </div>
    </ReporterShell>
  );
}
