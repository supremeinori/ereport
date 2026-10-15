"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08333c]">
      {/* Box Login Putih Persegi Tegas (Square / rounded-none) */}
      <div className="w-full max-w-[360px] bg-white rounded-none shadow-2xl p-8 border-t-4 border-[#348fe2]">
        {/* Logo Resmi Bersih Tanpa Gembok/Headset */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 bg-[#08333c] text-white flex flex-col items-center justify-center rounded-none shadow-sm border border-[#0c4a55]">
            <span className="text-xl font-black tracking-widest text-emerald-400">BPOM</span>
            <span className="text-3xs font-bold tracking-widest text-slate-300 uppercase">PADANG</span>
          </div>
          <h1 className="text-base font-extrabold tracking-wider text-slate-800 uppercase">
            E-REPORT PBOBA
          </h1>
          <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            SUMATERA BARAT
          </p>
        </div>

        {/* Label LOGIN */}
        <div className="text-left mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            LOGIN
          </span>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-300 rounded-none text-xs text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Username */}
          <div className="relative">
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-[#edf2f7] border border-slate-300 rounded-none text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#348fe2] pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Input Password */}
          <div className="relative">
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-[#edf2f7] border border-slate-300 rounded-none text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#348fe2] pr-10"
            />
          </div>

          {/* Tombol MASUK (Biru Tegas, Tanpa Logo Gembok) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-[#348fe2] hover:bg-[#287fc9] text-white font-bold text-xs uppercase tracking-wider rounded-none shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              "MASUK"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-2xs text-slate-400 font-mono">
            &copy; 2026 BBPOM di Padang. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
