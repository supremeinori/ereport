"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { btnPrimary, input, label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Silakan isi username dan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Gagal masuk ke sistem.");
        setIsLoading(false);
        return;
      }

      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/reporter/dashboard");
      }
      router.refresh();
    } catch {
      setErrorMessage("Terjadi gangguan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 grid lg:grid-cols-[1fr_1.05fr] min-h-screen bg-canvas">
      {/* Panel identitas, solid, tanpa efek kaca */}
      <section className="hidden lg:flex flex-col justify-between bg-purple-950 px-12 py-14 text-white">
        <div className="flex items-center gap-3">
          <Image
            src="/ereport_pboba_logo_v2.svg"
            alt="Logo E-Report PBOBA"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">E-Report PBOBA</p>
            <p className="text-2xs text-purple-200">Sumatera Barat</p>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="text-2xl font-bold leading-snug tracking-tight">
            Portal pelaporan dan pemeriksaan distribusi obat tradisional PBOT
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-purple-100/90">
            Akun diberikan oleh administrator wilayah. Gunakan username yang tercantum pada
            surat pengumuman resmi.
          </p>

          <dl className="mt-10 space-y-5 border-t border-white/15 pt-8">
            <div>
              <dt className="text-xs font-semibold text-purple-200">Entitas pelapor</dt>
              <dd className="mt-1 text-sm text-white/90">
                Mengunggah laporan semesteran dan memantau hasil pemeriksaan.
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-purple-200">Administrator</dt>
              <dd className="mt-1 text-sm text-white/90">
                Memeriksa berkas, mengelola akun entitas, dan menjawab pertanyaan.
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-2xs text-purple-200/80">
          © 2026 E-Report PBOBA, Sumatera Barat.
        </p>
      </section>

      {/* Formulir */}
      <section className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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

          <h1 className="text-2xl font-bold tracking-tight text-ink">Masuk ke portal</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Gunakan username akun entitas atau akun administrator.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-md border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className={label} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Nama pengguna"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className={input}
              />
            </div>

            <div>
              <label className={label} htmlFor="password">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={input}
              />
            </div>

            <button type="submit" disabled={isLoading} className={`${btnPrimary} w-full`}>
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Memproses
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-ink-soft">
            Belum punya akun? Hubungi administrator wilayah untuk meminta akun entitas.
          </p>
        </div>
      </section>
    </div>
  );
}
