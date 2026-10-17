import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-radial from-purple-50/50 via-slate-50 to-slate-100">
      {/* Subtle modern ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-xl shadow-purple-900/5 p-8 sm:p-10 text-center relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          E-Report <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">PBOBA</span>
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
          Sistem informasi modern pelaporan dan pemantauan distribusi obat tradisional
          untuk Pedagang Besar Obat Tradisional (PBOT) di wilayah Provinsi Sumatera Barat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <a
            href="https://wa.me/6281363622533"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.18 8.18 0 01-5.82 2.41c-1.45 0-2.88-.38-4.14-1.11l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.25-4.42c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
            </svg>
            <span>Hub. admin</span>
          </a>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Masuk ke Sistem</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>


      </div>
    </main>
  );
}

