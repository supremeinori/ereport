"use client";

import { useState } from "react";
import { badge, btnPrimary, btnQuiet, input, pageSubtitle, pageTitle, panel } from "@/components/ui";
import { formatDateUtc } from "@/lib/date-utils";

interface ReporterUser {
  id: string;
  identifier: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  address?: string | null;
  license_number?: string | null;
  license_date?: string | null;
  pic_name?: string | null;
  pic_phone?: string | null;
  description?: string | null;
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
      <div>
        <h1 className={pageTitle}>Identitas Akun Entitas Pelapor (PBOT)</h1>
        <p className={pageSubtitle}>
          Informasi resmi entitas pelapor yang terdaftar pada sistem E-Report PBOBA Sumatera Barat.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <svg className="h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-4 rounded-md px-2 py-1 text-xs font-semibold transition-colors hover:bg-black/5"
          >
            Tutup
          </button>
        </div>
      )}

      <div className={panel}>
        <div className="flex items-center justify-between gap-4 border-b border-line bg-canvas px-6 py-4">
          <span className="text-sm font-semibold text-ink">Data Resmi Entitas Pelapor</span>
          <span
            className={`${badge} ${
              user.is_active
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            Status akun: {user.is_active ? "aktif" : "nonaktif"}
          </span>
        </div>

        <dl className="divide-y divide-line p-6 sm:p-8">
          {/* Username / Identifier */}
          <div className="py-4 first:pt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Username login (identifier)</dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-1.5 font-mono text-sm font-semibold text-ink">
                  {user.identifier}
                </span>
                <span className="text-xs text-ink-soft">Dipakai untuk masuk ke sistem</span>
              </div>
            </dd>
          </div>

          {/* Nama PBOT */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Nama badan usaha / PT</dt>
            <dd className="mt-1 text-sm font-semibold text-ink sm:mt-0 sm:col-span-2">{user.name}</dd>
          </div>

          {/* Nomor Izin PBOT */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Nomor izin PBOT</dt>
            <dd className="mt-1 text-sm font-mono text-ink sm:mt-0 sm:col-span-2">
              {user.license_number || <span className="text-ink-soft/60">Belum tercatat</span>}
            </dd>
          </div>

          {/* Tanggal Terbit Izin */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Tanggal izin PBOT</dt>
            <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2">
              {user.license_date ? formatDateUtc(user.license_date) : <span className="text-ink-soft/60">Belum tercatat</span>}
            </dd>
          </div>

          {/* Alamat Usaha */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <dt className="text-sm font-medium text-ink-soft">Alamat sarana / gudang</dt>
            <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2">
              {user.address || <span className="text-ink-soft/60">Belum tercatat</span>}
            </dd>
          </div>

          {/* Penanggung Jawab (PIC) */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Penanggung jawab teknis (PIC)</dt>
            <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2">
              {user.pic_name ? (
                <span>
                  <strong>{user.pic_name}</strong>
                  {user.pic_phone && <span className="ml-2 font-mono text-xs text-ink-soft">({user.pic_phone})</span>}
                </span>
              ) : (
                <span className="text-ink-soft/60">Belum tercatat</span>
              )}
            </dd>
          </div>

          {/* Keterangan */}
          {user.description && (
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <dt className="text-sm font-medium text-ink-soft">Keterangan / Catatan</dt>
              <dd className="mt-1 text-sm text-ink-soft sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                {user.description}
              </dd>
            </div>
          )}

          {/* Email Korespondensi & Feedback */}
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <div>
              <dt className="text-sm font-medium text-ink-soft">Email feedback &amp; notifikasi</dt>
              <p className="mt-0.5 text-xs text-ink-soft">
                Dapat diubah mandiri untuk menerima umpan balik laporan.
              </p>
            </div>
            <dd className="mt-2 sm:mt-0 sm:col-span-2">
              {isEditingEmail ? (
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="alamat@perusahaan.co.id"
                      className={`${input} sm:w-80`}
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" disabled={saving || !newEmail.trim()} className={btnPrimary}>
                        {saving ? "Menyimpan..." : "Simpan email"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingEmail(false);
                          setNewEmail(user.email);
                        }}
                        disabled={saving}
                        className={btnQuiet}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                  <p className="text-2xs text-ink-soft">
                    Pastikan email aktif untuk menerima catatan pemeriksaan berkas dari petugas.
                  </p>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">
                    {user.email || <span className="text-ink-soft/60">Belum diisi</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail(user.email);
                      setIsEditingEmail(true);
                    }}
                    className={btnQuiet}
                  >
                    Ubah email
                  </button>
                </div>
              )}
            </dd>
          </div>

          {/* Peran Sistem */}
          <div className="py-4 last:pb-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
            <dt className="text-sm font-medium text-ink-soft">Peran sistem (role)</dt>
            <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2">
              <span className={`${badge} border-purple-200 bg-purple-50 text-purple-900`}>
                Reporter (entitas PBOT)
              </span>
            </dd>
          </div>
        </dl>

        <div className="flex items-start gap-2.5 border-t border-line bg-canvas px-6 py-4 text-xs text-ink-soft">
          <span>
            <strong className="text-ink">Catatan penggunaan:</strong> Anda selalu menggunakan{" "}
            <strong className="text-ink">username</strong> di atas untuk login ke portal. Profil perizinan dan badan usaha
            dikelola oleh Administrator Dinas Kesehatan. Jika terdapat perubahan perizinan atau PIC teknis, hubungi admin melalui menu Bantuan Pertanyaan.
          </span>
        </div>
      </div>
    </div>
  );
}
