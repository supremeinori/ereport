import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-none shadow-sm p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
          <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse"></span>
          Prototipe Sistem Pelaporan PBOT Sumatera Barat
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          E-Report PBOBA
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Sistem informasi pelaporan dan pemantauan distribusi obat tradisional
          untuk Pedagang Besar Obat Tradisional (PBOT) di wilayah Sumatera Barat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-none text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Masuk ke Sistem (Login)
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Versi 1.1 (Modul M0 Fondasi)</span>
          <span>Keamanan Terkelola Mandiri</span>
        </div>
      </div>
    </main>
  );
}
