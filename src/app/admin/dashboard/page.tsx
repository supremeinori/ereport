import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { panel } from "@/components/ui";

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

  const shortcuts = [
    {
      href: "/admin/template",
      title: "Template Excel Resmi",
      body: "Unduh atau perbarui berkas .xlsx yang dipakai seluruh entitas pelapor.",
    },
    {
      href: "/admin/backups",
      title: "Pemantauan Cadangan Drive",
      body: "Status pencadangan arsip berkas ke penyimpanan sekunder.",
    },
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-8">
        <header className="border-b border-line pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard pemeriksaan</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Ringkasan laporan semester yang masuk dari entitas PBOT terdaftar.
          </p>
        </header>

        {/* Angka kunci, satu strip register, bukan kumpulan kartu gradien */}
        <section className={`${panel} grid sm:grid-cols-3`}>
          <div className="border-b border-line px-5 py-5 sm:border-b-0 sm:border-r">
            <p className="text-xs font-medium text-ink-soft">Total laporan</p>
            <p className="tabular mt-2 text-3xl font-bold text-ink">{totalReports}</p>
            <p className="mt-1 text-xs text-ink-soft">Seluruh berkas yang masuk</p>
          </div>
          <div className="border-b border-line px-5 py-5 sm:border-b-0 sm:border-r">
            <p className="text-xs font-medium text-ink-soft">Menunggu pemeriksaan</p>
            <p className="tabular mt-2 text-3xl font-bold text-purple-700">{pendingReports}</p>
            <p className="mt-1 text-xs text-ink-soft">Antrean kerja pemeriksaan</p>
          </div>
          <div className="px-5 py-5">
            <p className="text-xs font-medium text-ink-soft">Sudah diperiksa</p>
            <p className="tabular mt-2 text-3xl font-bold text-ink">{approvedReports}</p>
            <p className="mt-1 text-xs text-ink-soft">Diverifikasi dan ditutup</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Pekerjaan yang menunggu perhatian */}
          <section className={`${panel} divide-y divide-line`}>
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold text-ink">Perlu perhatian</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Angka berikut berasal dari data yang tercatat di sistem.
              </p>
            </div>

            <Link
              href="/admin/reports"
              className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-purple-50/60"
            >
              <span className="tabular w-14 shrink-0 text-2xl font-bold text-rose-600">
                {revisionReports}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">Laporan perlu revisi</span>
                <span className="block text-xs text-ink-soft">
                  Berkas yang dikembalikan ke entitas dan menunggu perbaikan.
                </span>
              </span>
              <svg className="h-4 w-4 shrink-0 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/reporters"
              className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-purple-50/60"
            >
              <span className="tabular w-14 shrink-0 text-2xl font-bold text-ink">
                {totalReporters}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">Entitas pelapor terdaftar</span>
                <span className="block text-xs text-ink-soft">
                  Akun PBOT yang dapat mengirim berkas semesteran.
                </span>
              </span>
              <svg className="h-4 w-4 shrink-0 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/questions"
              className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-purple-50/60"
            >
              <span className="tabular w-14 shrink-0 text-2xl font-bold text-ink">
                {totalQuestions}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">Pertanyaan dari entitas</span>
                <span className="block text-xs text-ink-soft">
                  Total tiket konsultasi yang masuk pada layanan tanya jawab.
                </span>
              </span>
              <svg className="h-4 w-4 shrink-0 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>

          {/* Tautan kerja lain */}
          <section className={`${panel} divide-y divide-line`}>
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold text-ink">Tautan kerja</h2>
            </div>
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-5 py-4 transition-colors duration-150 hover:bg-purple-50/60"
              >
                <span className="block text-sm font-semibold text-ink">{item.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{item.body}</span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
