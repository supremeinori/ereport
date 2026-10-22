import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ReporterShell from "@/components/ReporterShell";
import Link from "next/link";
import { panel } from "@/components/ui";

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

  const total = myTotalReports;
  const percent = (value: number) => (total === 0 ? 0 : (value / total) * 100);

  const segments = [
    { label: "Sudah diperiksa", value: myApprovedReports, color: "bg-purple-700" },
    { label: "Menunggu pemeriksaan", value: myPendingReports, color: "bg-amber-500" },
    { label: "Perlu revisi", value: myRevisionReports, color: "bg-rose-500" },
  ];

  return (
    <ReporterShell user={user}>
      <div className="space-y-8">
        <header className="border-b border-line pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Status pelaporan entitas</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Rekapitulasi berkas semester yang pernah Anda unggah.
          </p>
        </header>

        {/* Angka + bilah kepatuhan, satu panel register */}
        <section className={panel}>
          <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
            {segments.map((segment) => (
              <div key={segment.label} className="bg-surface px-5 py-5">
                <p className="text-xs font-medium text-ink-soft">{segment.label}</p>
                <p className="tabular mt-2 text-3xl font-bold text-ink">{segment.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-line px-5 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold text-ink">Kelengkapan berkas</h2>
              <p className="tabular text-xs text-ink-soft">
                {myApprovedReports} dari {total} berkas sudah diperiksa
              </p>
            </div>

            {total === 0 ? (
              <p className="mt-3 rounded-md border border-line bg-canvas px-4 py-3 text-xs text-ink-soft">
                Belum ada berkas yang diunggah, sehingga kelengkapan belum dapat dihitung.
                Gunakan formulir pelaporan semester untuk mengirim berkas pertama.
              </p>
            ) : (
              <>
                <div
                  className="mt-3 flex h-2 w-full overflow-hidden rounded-sm bg-line"
                  role="img"
                  aria-label={`${myApprovedReports} sudah diperiksa, ${myPendingReports} menunggu pemeriksaan, ${myRevisionReports} perlu revisi`}
                >
                  {segments.map((segment) =>
                    segment.value > 0 ? (
                      <div
                        key={segment.label}
                        className={segment.color}
                        style={{ width: `${percent(segment.value)}%` }}
                      />
                    ) : null
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
                  {segments.map((segment) => (
                    <li key={segment.label} className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className={`h-2 w-2 rounded-sm ${segment.color}`} aria-hidden="true" />
                      {segment.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Dua pekerjaan yang bisa dikerjakan sekarang */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${panel} flex flex-col justify-between p-6`}>
            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-800">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
                </svg>
              </span>
              <h2 className="mt-4 text-base font-bold text-ink">Unggah laporan semester baru</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Kirim berkas Excel (.xlsx) menggunakan template resmi E-Report PBOBA. Satu
                berkas untuk satu periode semester.
              </p>
            </div>
            <Link
              href="/reporter/reports"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-purple-700 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-800"
            >
              Buka formulir pelaporan
            </Link>
          </section>

          <section className={`${panel} flex flex-col justify-between p-6`}>
            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-800">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10.5h8M8 14h5M21 12a9 9 0 11-3.2-6.9M21 4v5h-5" />
                </svg>
              </span>
              <h2 className="mt-4 text-base font-bold text-ink">
                Tanya jawab
                <span className="tabular ml-2 text-sm font-medium text-ink-soft">
                  {myQuestionsCount} tiket
                </span>
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Ajukan pertanyaan seputar pengisian template atau dasar regulasi pelaporan
                kepada administrator.
              </p>
            </div>
            <Link
              href="/reporter/questions"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-line-strong px-5 text-sm font-semibold text-ink transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900"
            >
              Buka layanan tanya jawab
            </Link>
          </section>
        </div>
      </div>
    </ReporterShell>
  );
}
