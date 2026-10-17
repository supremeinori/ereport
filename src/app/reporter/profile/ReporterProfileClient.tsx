"use client";

import { useState } from "react";

interface ReporterUser {
  id: string;
  identifier: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface ReporterProfileClientProps {
  initialUser: ReporterUser;
}

export default function ReporterProfileClient({ initialUser }: ReporterProfileClientProps) {
  const [user, setUser] = useState<ReporterUser>(initialUser);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(initialUser.email);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/reporter/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Gagal memperbarui email.");
      }

      setUser((prev) => ({ ...prev, email: resData.reporter.email }));
      setIsEditingEmail(false);
      setFeedback({
        text: "Alamat email korespondensi & feedback berhasil diperbarui.",
        type: "success",
      });
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Identitas Resmi Pelapor
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Identitas Akun Entitas Pelapor (PBOT)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi resmi entitas pelapor yang terdaftar pada sistem E-Report PBOBA Sumatera Barat.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
              : "bg-rose-50 text-rose-800 border border-rose-200/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/5 transition-colors ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-white border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
              Data Resmi Entitas Pelapor
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Status Akun: {user.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        <div className="p-6 sm:p-8 divide-y divide-slate-100">
          {/* Username / Identifier */}
          <div className="py-4 first:pt-0 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-semibold text-slate-700">
              Username Login (Identifier)
            </dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-bold text-purple-900 bg-purple-50/90 px-3.5 py-1.5 rounded-xl border border-purple-200/80 inline-flex items-center gap-2 shadow-2xs">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.identifier}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (Digunakan untuk masuk ke sistem)
                </span>
              </div>
            </dd>
          </div>

          {/* Nama PBOT */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-semibold text-slate-700">
              Nama Badan Usaha / PT
            </dt>
            <dd className="mt-1 text-sm font-bold text-slate-900 sm:mt-0 sm:col-span-2">
              {user.name}
            </dd>
          </div>

          {/* Email Korespondensi & Feedback (BISA DIEDIT) */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 items-start">
            <div>
              <dt className="text-sm font-semibold text-slate-700">
                Email Feedback &amp; Notifikasi
              </dt>
              <p className="text-xs text-slate-400 mt-0.5">
                Dapat diubah untuk menerima umpan balik laporan.
              </p>
            </div>
            <dd className="mt-2 sm:mt-0 sm:col-span-2">
              {isEditingEmail ? (
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="alamat@perusahaan.com"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 w-full sm:w-80 transition-all shadow-2xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving || !newEmail.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-sm shadow-purple-500/20"
                      >
                        {saving ? "Menyimpan..." : "Simpan Email"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setNewEmail(user.email);
                        }}
                        disabled={saving}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                  <p className="text-2xs text-slate-400">
                    Pastikan email aktif untuk menerima catatan pemeriksaan berkas dari petugas.
                  </p>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-800">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      setNewEmail(user.email);
                      setIsEditingEmail(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 transition-colors shadow-2xs"
                  >
                    Ubah Email
                  </button>
                </div>
              )}
            </dd>
          </div>

          {/* Peran Sistem */}
          <div className="py-4 last:pb-0 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-semibold text-slate-700">
              Peran Sistem (Role)
            </dt>
            <dd className="mt-1 text-sm text-slate-800 sm:mt-0 sm:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 text-purple-800 border border-purple-200">
                Reporter (Entitas PBOT)
              </span>
            </dd>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2.5">
          <span className="text-base shrink-0">💡</span>
          <span>
            <strong>Catatan Penggunaan:</strong> Anda selalu menggunakan <strong>Username</strong> di atas untuk login ke aplikasi. Alamat email di atas digunakan oleh Administrator sebagai kontak resmi untuk mengirimkan evaluasi berkas dan tanggapan atas pertanyaan Anda.
          </span>
        </div>
      </div>
    </div>
  );
}
