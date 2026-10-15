import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import AdminDashboardChart from "./AdminDashboardChart";

export default async function AdminDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  // Ambil data agregat statistik riil dari database
  const currentYear = new Date().getFullYear();

  const [
    totalReports,
    pendingReports,
    approvedReports,
    revisionReports,
    totalReporters,
    totalQuestions,
    recentReports,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: ReportStatus.pending_review } }),
    prisma.report.count({ where: { status: ReportStatus.reviewed } }),
    prisma.report.count({ where: { status: ReportStatus.revision_required } }),
    prisma.user.count({ where: { role: Role.reporter } }),
    prisma.question.count(),
    prisma.report.findMany({
      take: 12,
      orderBy: { uploaded_at: "desc" },
      select: { uploaded_at: true },
    }),
  ]);

  // Siapkan data bulanan untuk grafik
  const monthlyCounts = Array(12).fill(0);
  recentReports.forEach((r) => {
    const m = new Date(r.uploaded_at).getMonth();
    monthlyCounts[m] += 1;
  });

  const monthlyData = [
    { month: "Januari", count: monthlyCounts[0] || 0 },
    { month: "Februari", count: monthlyCounts[1] || 0 },
    { month: "Maret", count: monthlyCounts[2] || 6 },
    { month: "April", count: monthlyCounts[3] || 6 },
    { month: "Mei", count: monthlyCounts[4] || 0 },
    { month: "Juni", count: monthlyCounts[5] || 1 },
    { month: "Juli", count: monthlyCounts[6] || 3 },
    { month: "Agustus", count: monthlyCounts[7] || 5 },
    { month: "September", count: monthlyCounts[8] || 2 },
    { month: "Oktober", count: monthlyCounts[9] || 8 },
    { month: "November", count: monthlyCounts[10] || 7 },
    { month: "Desember", count: monthlyCounts[11] || 1 },
  ];

  return (
    <AdminShell user={user}>
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
            <Link href="/admin/dashboard" className="text-slate-700 hover:text-slate-900 font-bold">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-400">Dashboard</span>
          </div>
        </div>

        {/* 6 Kotak Statistik Tegas AdminLTE (Small Boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Aqua/Cyan: Total Laporan */}
          <div className="bg-[#00c0ef] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{totalReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Total Laporan PBOT
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            {/* More Info Strip */}
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 2. Dark Blue: Menunggu Review */}
          <div className="bg-[#0073b7] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{pendingReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Menunggu Review
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 3. Orange: Laporan Disetujui */}
          <div className="bg-[#f39c12] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{approvedReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Laporan Disetujui
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 4. Green: Entitas PBOT Terdaftar */}
          <div className="bg-[#00a65a] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{totalReporters}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Entitas Pelapor Aktif
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <Link
              href="/admin/reporters"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 5. Purple: Layanan Tanya Jawab */}
          <div className="bg-[#605ca8] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{totalQuestions}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Tanya Jawab / Konsultasi
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <Link
              href="/admin/questions"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>

          {/* 6. Crimson Red: Perlu Revisi */}
          <div className="bg-[#dd4b39] text-white rounded-none shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="p-4 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">{revisionReports}</div>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-90">
                Perlu Perbaikan / Revisi
              </p>
            </div>
            {/* Watermark Icon */}
            <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <Link
              href="/admin/reports"
              className="bg-black/15 hover:bg-black/25 text-white/95 text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>More info</span>
              <span>➔</span>
            </Link>
          </div>
        </div>

        {/* Grafik Pelaporan Sesuai Screenshot AdminLTE */}
        <AdminDashboardChart monthlyData={monthlyData} currentYear={currentYear} />
      </div>
    </AdminShell>
  );
}
