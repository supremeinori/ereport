import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-radial from-purple-50/50 via-slate-50 to-slate-100">
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-xl shadow-purple-900/5 p-8 sm:p-10 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
          Sistem Pelaporan PBOT Sumatera Barat
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          E-Report <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">PBOBA</span>
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
          Sistem informasi modern pelaporan dan pemantauan distribusi obat tradisional
          untuk Pedagang Besar Obat Tradisional (PBOT) di bawah pengawasan Dinas Kesehatan &amp; BBPOM Sumatera Barat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Masuk ke Sistem (Login)</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-500">Versi 1.1</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Keamanan Terenkripsi
          </span>
        </div>
      </div>
    </main>
  );
}

