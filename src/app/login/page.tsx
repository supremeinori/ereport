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

  const handleReset = () => {
    setUsername("");
    setPassword("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#08333c]">
      {/* Box Login Putih Tegas Tanpa Rounded */}
      <div className="w-full max-w-[370px] bg-white rounded-none shadow-2xl p-8 border-t-4 border-[#348fe2]">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
            {/* SVG Logo Headset / Helpdesk BBPOM */}
            <svg
              className="w-20 h-20 text-[#08333c]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#f59e0b" strokeWidth="5" fill="#f8fafc" />
              {/* Headband */}
              <path
                d="M 26 52 A 24 24 0 0 1 74 52"
                stroke="#08333c"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Earpieces */}
              <rect x="20" y="46" width="10" height="22" rx="3" fill="#08333c" />
              <rect x="70" y="46" width="10" height="22" rx="3" fill="#08333c" />
              {/* Mic boom */}
              <path
                d="M 25 64 Q 25 78 45 78"
                stroke="#08333c"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="47" cy="78" r="4" fill="#08333c" />
              {/* Text inside badge */}
              <text
                x="50"
                y="48"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#08333c"
                letterSpacing="1"
              >
                E-REPORT
              </text>
              <text
                x="50"
                y="60"
                textAnchor="middle"
                fontSize="9"
                fontWeight="900"
                fill="#08333c"
                letterSpacing="1"
              >
                PBOBA
              </text>
            </svg>
          </div>
          <h1 className="text-base font-extrabold tracking-wider text-slate-700 uppercase">
            E-REPORT PBOBA
          </h1>
          <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            BBPOM DI PADANG
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Tombol MASUK (Biru Tegas) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#348fe2] hover:bg-[#287fc9] text-white font-bold text-xs uppercase tracking-wider rounded-none shadow-sm transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
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
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>MASUK</span>
              </>
            )}
          </button>

          {/* Tombol KEMBALI (Merah Tegas) */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#e0533c] hover:bg-[#c8442e] text-white font-bold text-xs uppercase tracking-wider rounded-none shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>KEMBALI</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-2xs text-slate-400">
            © 2026 BBPOM di Padang. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
