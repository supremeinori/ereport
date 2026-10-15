import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterNavbar from "@/components/ReporterNavbar";
import Link from "next/link";

export default async function ReporterDashboardPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ReporterNavbar user={user} currentPath="/reporter/dashboard" />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Portal Pelaporan PBOT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang, <strong className="text-slate-800">{user.name}</strong> ({user.identifier}).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Identitas Entitas Pelapor
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Terverifikasi
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Lihat data kode unik entitas pelapor, nama badan usaha PBOT, dan alamat email resmi yang terdaftar pada sistem.
            </p>
            <Link
              href="/reporter/profile"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Lihat Profil Entitas →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Unggah Laporan Semester
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tersedia
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pengunggahan berkas laporan Excel semesteran resmi, riwayat pelaporan, dan pemantauan status verifikasi laporan oleh admin.
            </p>
            <Link
              href="/reporter/reports"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buka Halaman Pelaporan →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
