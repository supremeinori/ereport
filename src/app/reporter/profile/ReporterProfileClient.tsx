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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Identitas Akun Entitas Pelapor (PBOT)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi resmi entitas pelapor yang terdaftar pada sistem E-Report PBOBA Sumatera Barat.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-none-none text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="bg-white rounded-none-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Data Resmi Entitas Pelapor
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none-none text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-none-none bg-emerald-500"></span>
            Status Akun: {user.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        <div className="p-6 divide-y divide-slate-100">
          {/* Username / Identifier */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-semibold text-slate-700">
              Username Login (Identifier)
            </dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-none-none border border-slate-200">
                  {user.identifier}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (Digunakan untuk masuk ke sistem)
                </span>
              </div>
            </dd>
          </div>

          {/* Nama PBOT */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-semibold text-slate-700">
              Nama Badan Usaha / PT
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 sm:mt-0 sm:col-span-2">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="alamat@perusahaan.com"
                      className="px-3 py-1.5 rounded-none-none border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-80"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving || !newEmail.trim()}
                        className="px-3 py-1.5 rounded-none-none text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
                        className="px-3 py-1.5 rounded-none-none text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
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
                    className="px-2.5 py-1 text-xs font-semibold rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Ubah Email
                  </button>
                </div>
              )}
            </dd>
          </div>

          {/* Peran Sistem */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-semibold text-slate-700">
              Peran Sistem (Role)
            </dt>
            <dd className="mt-1 text-sm text-slate-800 sm:mt-0 sm:col-span-2">
              <span className="px-2.5 py-0.5 rounded-none text-xs font-semibold bg-blue-100 text-blue-800">
                Reporter (Entitas PBOT)
              </span>
            </dd>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          💡 <strong>Catatan Penggunaan:</strong> Anda selalu menggunakan <strong>Username</strong> di atas untuk login ke aplikasi. Alamat email di atas digunakan oleh Administrator sebagai kontak resmi untuk mengirimkan evaluasi berkas dan tanggapan atas pertanyaan Anda.
        </div>
      </div>
    </div>
  );
}
