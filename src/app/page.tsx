import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    title: "Unggah berkas semester",
    body: "Entitas PBOT mengirim berkas Excel .xlsx sesuai template resmi, satu periode satu berkas.",
  },
  {
    title: "Administrator memeriksa",
    body: "Isi berkas dibuka langsung di dalam sistem, lalu diperiksa kelengkapan dan konsistensinya.",
  },
  {
    title: "Status laporan diperbarui",
    body: "Berkas ditandai sudah diperiksa, atau dikembalikan ke entitas untuk revisi.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/ereport_pboba_logo_v2.svg"
              alt="Logo E-Report PBOBA"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-ink">E-Report PBOBA</p>
              <p className="text-2xs text-ink-soft">Sumatera Barat</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-purple-700 transition-colors duration-150 hover:text-purple-900"
          >
            Masuk ke portal
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              Pelaporan distribusi obat tradisional untuk PBOT Sumatera Barat
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Setiap entitas Pedagang Besar Obat Tradisional mengunggah laporan semesteran
              dalam format Excel yang sama. Administrator memverifikasi isi berkas di dalam
              portal dan mencatat hasil pemeriksaan pada satu arsip.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-md bg-purple-700 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-800">
                Masuk ke portal
              </Link>
              <a
                href="https://wa.me/6281363622533"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-6 text-sm font-semibold text-ink transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.18 8.18 0 01-5.82 2.41c-1.45 0-2.88-.38-4.14-1.11l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.25-4.42c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
                </svg>
                Hubungi administrator
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-2xs font-medium text-ink-soft">Periode laporan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">Semesteran</dd>
              </div>
              <div>
                <dt className="text-2xs font-medium text-ink-soft">Format berkas</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">Excel, 18 kolom</dd>
              </div>
              <div>
                <dt className="text-2xs font-medium text-ink-soft">Pemeriksaan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">Internal</dd>
              </div>
            </dl>
          </div>

          <aside className="lg:pt-2">
            <div className="rounded-lg border border-line bg-surface shadow-panel">
              <div className="border-b border-line px-6 py-4">
                <h2 className="text-sm font-bold tracking-tight text-ink">Alur pelaporan</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Tiga langkah yang berlaku untuk semua entitas pelapor.
                </p>
              </div>
              <ol className="divide-y divide-line">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4 px-6 py-5">
                    <span className="font-mono text-xs font-semibold tabular text-purple-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="border-t border-line bg-purple-50/60 px-6 py-3.5 text-xs leading-relaxed text-ink-soft">
                Bila berkas dikembalikan untuk revisi, entitas mengunggah ulang berkas untuk
                periode yang sama dan status pemeriksaan kembali ke antrean.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>E-Report PBOBA, Sumatera Barat.</p>
          <p className="font-mono text-2xs">Sistem pelaporan distribusi obat tradisional</p>
        </div>
      </footer>
    </div>
  );
}
