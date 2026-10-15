import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterNavbar from "@/components/ReporterNavbar";

export default async function ReporterProfilePage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ReporterNavbar user={user} currentPath="/reporter/profile" />

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Identitas Akun Entitas Pelapor (PBOT)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Informasi resmi entitas pelapor yang terdaftar pada sistem E-Report PBOBA Sumatera Barat.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Data Resmi Entitas Pelapor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Status Akun: Aktif
            </span>
          </div>

          <div className="p-6 divide-y divide-slate-100">
            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-semibold text-slate-600">Kode Unik Identifier</dt>
              <dd className="mt-1 text-sm font-mono font-bold text-slate-900 sm:mt-0 sm:col-span-2">
                {user.identifier}
              </dd>
            </div>

            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-semibold text-slate-600">Nama Entitas PBOT</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 sm:mt-0 sm:col-span-2">
                {user.name}
              </dd>
            </div>

            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-semibold text-slate-600">Alamat Email Resmi</dt>
              <dd className="mt-1 text-sm text-slate-800 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>

            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-semibold text-slate-600">Peran Sistem (Role)</dt>
              <dd className="mt-1 text-sm text-slate-800 sm:mt-0 sm:col-span-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </dd>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            Catatan: Identitas entitas pelapor dikelola langsung oleh Administrator. Jika terdapat perubahan nama badan usaha atau email resmi, silakan hubungi administrator via menu Tanya Jawab.
          </div>
        </div>
      </main>
    </div>
  );
}
