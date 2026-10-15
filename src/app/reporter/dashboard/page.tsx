import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterShell from "@/components/ReporterShell";
import Link from "next/link";

export default async function ReporterDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <ReporterShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Portal Pelaporan PBOT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang, <strong className="text-slate-800">{user.name}</strong> (@{user.identifier}).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Pelaporan Semester */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tersedia
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Unggah Laporan Semester
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Unggah berkas laporan Excel semesteran resmi, pantau riwayat pelaporan, dan periksa status verifikasi laporan oleh petugas.
              </p>
            </div>
            <Link
              href="/reporter/reports"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Buka Halaman Pelaporan →
            </Link>
          </div>

          {/* Card Tanya Jawab */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bantuan
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Layanan Tanya Jawab
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Sampaikan kendala teknis atau pertanyaan regulasi seputar pelaporan distribusi langsung ke Administrator E-Report PBOBA.
              </p>
            </div>
            <Link
              href="/reporter/questions"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Buka Tanya Jawab →
            </Link>
          </div>

          {/* Card Profil Entitas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Akun
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                Profil Entitas PBOT
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Lihat informasi akun entitas pelapor dan ubah email korespondensi untuk penerimaan feedback evaluasi laporan.
              </p>
            </div>
            <Link
              href="/reporter/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Lihat Profil Entitas →
            </Link>
          </div>
        </div>
      </div>
    </ReporterShell>
  );
}
