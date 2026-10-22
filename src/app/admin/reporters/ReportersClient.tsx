"use client";

import { useState, useEffect, useCallback } from "react";
import { badge, btnPrimary, btnSecondary, input, label, panel } from "@/components/ui";

interface Reporter {
  id: string;
  identifier: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    reports: number;
  };
}

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 9h9a2 2 0 012 2v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9a2 2 0 012-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
    </svg>
  );
}

export default function ReportersClient() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Tambah Reporter Baru
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Modal Sukses & Salin Kredensial Akun Baru
  const [createdAccountData, setCreatedAccountData] = useState<{
    name: string;
    identifier: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Modal Konfirmasi Toggle Status Aktif
  const [confirmModalData, setConfirmModalData] = useState<{
    reporter: Reporter;
    targetStatus: boolean;
  } | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchReporters = useCallback(async (query: string = "") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/reporters?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat daftar reporter.");
      }
      setReporters(data.reporters || []);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReporters();
  }, [fetchReporters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReporters(searchQuery);
  };

  const getCredentialMessage = (name: string, identifier: string, passwordText?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `Selamat siang Bapak/Ibu pimpinan ${name},

Berikut adalah akun resmi untuk pelaporan E-Report PBOBA Sumatera Barat:
• Username : ${identifier}${passwordText ? `\n• Password : ${passwordText}` : ""}
• Tautan Login : ${origin}/login

Akun ini digunakan untuk menyampaikan laporan berkas semesteran distribusi obat tradisional (PBOT).

Terima kasih.`;
  };

  const handleCopyText = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleAddReporter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!newIdentifier || !newName || !newPassword) {
      setAddFormError("Identifier, nama entitas, dan kata sandi wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setAddFormError("Kata sandi minimal 8 karakter.");
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch("/api/admin/reporters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: newIdentifier.trim(),
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat akun reporter.");
      }

      // Tampilkan modal salin kredensial
      setCreatedAccountData({
        name: newName.trim(),
        identifier: data.reporter.identifier,
        email: newEmail.trim(),
        password: newPassword,
      });
      setCopied(false);

      setIsAddModalOpen(false);
      // Reset form input
      setNewIdentifier("");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      fetchReporters(searchQuery);
    } catch (err: unknown) {
      const error = err as Error;
      setAddFormError(error.message);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!confirmModalData) return;
    const { reporter, targetStatus } = confirmModalData;
    setIsTogglingStatus(true);

    try {
      const res = await fetch(`/api/admin/reporters/${reporter.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah status akun.");
      }

      setSuccessMessage(data.message);
      setConfirmModalData(null);
      fetchReporters(searchQuery);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Kelola akun entitas PBOT</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Daftar seluruh entitas pelapor yang terdaftar di wilayah Sumatera Barat.
          </p>
        </div>
        <button
          onClick={() => {
            setAddFormError(null);
            setIsAddModalOpen(true);
          }}
          className={btnPrimary}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m7-7H5" />
          </svg>
          Tambah akun entitas
        </button>
      </header>

      {/* Pesan Sukses / Error Notifikasi */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Kontrol Pencarian */}
      <div className={`${panel} p-4`}>
        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-soft">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
            <input
              type="text"
              aria-label="Cari entitas pelapor"
              placeholder="Cari nama badan usaha atau username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${input} pl-9`}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary}>
              Cari
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchReporters("");
                }}
                className={btnSecondary}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Reporter */}
      <div className={`${panel} overflow-hidden`}>
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <svg className="mx-auto h-6 w-6 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="mt-3 text-sm text-ink-soft">Memuat daftar entitas...</p>
          </div>
        ) : reporters.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-ink">
              {searchQuery
                ? "Tidak ada entitas yang cocok dengan pencarian."
                : "Belum ada akun entitas terdaftar."}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-ink-soft">
              {searchQuery
                ? "Ubah kata kunci atau kosongkan pencarian untuk melihat seluruh daftar."
                : "Tambahkan akun entitas pertama agar mereka dapat mengirim berkas semesteran."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead className="border-b border-line bg-canvas">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Username login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Nama badan usaha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Email korespondensi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Berkas masuk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Terdaftar
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reporters.map((rep) => (
                  <tr key={rep.id} className="transition-colors duration-150 hover:bg-purple-50/40">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-purple-900">
                        {rep.identifier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{rep.name}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {rep.email || <span className="text-ink-soft/60">Belum diisi</span>}
                    </td>
                    <td className="px-4 py-3">
                      {rep.is_active ? (
                        <span className={`${badge} border-emerald-200 bg-emerald-50 text-emerald-800`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                          Aktif
                        </span>
                      ) : (
                        <span className={`${badge} border-rose-200 bg-rose-50 text-rose-800`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" aria-hidden="true" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="tabular px-4 py-3 text-xs text-ink-soft">
                      {rep._count?.reports || 0} berkas
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {new Date(rep.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const msg = getCredentialMessage(rep.name, rep.identifier);
                            handleCopyText(msg);
                            setSuccessMessage(`Akun lengkap (Username) untuk ${rep.name} berhasil disalin!`);
                          }}
                          title="Salin username untuk reporter"
                          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900"
                        >
                          <CopyIcon className="h-3.5 w-3.5" />
                          Salin
                        </button>

                        {rep.is_active ? (
                          <button
                            onClick={() =>
                              setConfirmModalData({
                                reporter: rep,
                                targetStatus: false,
                              })
                            }
                            className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors duration-150 hover:bg-rose-50"
                          >
                            Nonaktifkan
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirmModalData({
                                reporter: rep,
                                targetStatus: true,
                              })
                            }
                            className="rounded-md border border-emerald-300 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors duration-150 hover:bg-emerald-50"
                          >
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Sukses Pembuatan Akun & Tombol Copy Kredensial */}
      {createdAccountData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-title"
            className="w-full max-w-lg rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="border-b border-line px-6 py-4">
              <h3 id="credential-title" className="text-base font-bold text-ink">
                Informasi akses entitas PBOT
              </h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Akun berhasil dibuat. Salin informasi di bawah untuk dibagikan kepada pihak
                pimpinan entitas pelapor.
              </p>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Kotak Ringkasan Akun */}
              <dl className="divide-y divide-line rounded-md border border-line bg-canvas px-4 py-1">
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs text-ink-soft">Nama badan usaha</dt>
                  <dd className="text-sm font-semibold text-ink">{createdAccountData.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs text-ink-soft">Username login</dt>
                  <dd className="rounded-sm border border-purple-200 bg-purple-50 px-2 py-0.5 font-mono text-xs font-semibold text-purple-800">
                    {createdAccountData.identifier}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs text-ink-soft">Kata sandi</dt>
                  <dd className="rounded-sm bg-line px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                    {createdAccountData.password}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-xs text-ink-soft">Email korespondensi</dt>
                  <dd className="text-sm text-ink-soft">
                    {createdAccountData.email || "Tidak diisi"}
                  </dd>
                </div>
              </dl>

              {/* Preview Teks Pesan */}
              <div>
                <p className="mb-1 text-xs font-semibold text-ink-soft">
                  Pratinjau pesan yang akan disalin
                </p>
                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-line bg-canvas p-3 font-sans text-xs leading-relaxed text-ink">
                  {getCredentialMessage(
                    createdAccountData.name,
                    createdAccountData.identifier,
                    createdAccountData.password
                  )}
                </pre>
              </div>

              <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setCreatedAccountData(null)}
                  className={btnSecondary}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      getCredentialMessage(
                        createdAccountData.name,
                        createdAccountData.identifier,
                        createdAccountData.password
                      )
                    )
                  }
                  className={btnPrimary}
                >
                  {copied ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Tersalin ke clipboard
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Salin pesan kredensial
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Reporter Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-reporter-title"
            className="w-full max-w-lg rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="border-b border-line px-6 py-4">
              <h3 id="add-reporter-title" className="text-base font-bold text-ink">
                Pendaftaran akun entitas baru
              </h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Akun ini hanya dapat mengirim berkas laporan, tidak dapat mengakses modul
                pemeriksaan.
              </p>
            </div>

            <div className="px-6 py-5">
              {addFormError && (
                <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700" role="alert">
                  {addFormError}
                </div>
              )}

              <form onSubmit={handleAddReporter} className="space-y-4">
                <div>
                  <label className={label} htmlFor="new-identifier">
                    Kode identifier entitas
                    <span className="text-rose-600"> *</span>
                  </label>
                  <input
                    id="new-identifier"
                    type="text"
                    required
                    placeholder="PBOT-000-00"
                    value={newIdentifier}
                    onChange={(e) => setNewIdentifier(e.target.value)}
                    className={`${input} font-mono uppercase`}
                  />
                  <p className="mt-1 text-2xs text-ink-soft">
                    Kode ini dipakai entitas untuk masuk ke portal.
                  </p>
                </div>

                <div>
                  <label className={label} htmlFor="new-name">
                    Nama badan usaha
                    <span className="text-rose-600"> *</span>
                  </label>
                  <input
                    id="new-name"
                    type="text"
                    required
                    placeholder="Nama badan usaha"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={input}
                  />
                </div>

                <div>
                  <label className={label} htmlFor="new-email">
                    Email korespondensi dan feedback
                  </label>
                  <input
                    id="new-email"
                    type="email"
                    placeholder="nama@entitas.co.id"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={input}
                  />
                  <p className="mt-1 text-2xs text-ink-soft">
                    Opsional. Dipakai administrator untuk mengevaluasi berkas dan dapat diubah oleh pelapor.
                  </p>
                </div>

                <div>
                  <label className={label} htmlFor="new-password">
                    Kata sandi awal
                    <span className="text-rose-600"> *</span>
                  </label>
                  <input
                    id="new-password"
                    type="text"
                    required
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${input} font-mono`}
                  />
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-line pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmittingAdd}
                    className={btnSecondary}
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingAdd} className={btnPrimary}>
                    {isSubmittingAdd ? "Menyimpan" : "Buat akun"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Aktifkan / Nonaktifkan */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="toggle-status-title"
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="px-6 py-5">
              <h3 id="toggle-status-title" className="text-base font-bold text-ink">
                Konfirmasi {confirmModalData.targetStatus ? "aktivasi" : "penonaktifan"} akun
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {confirmModalData.targetStatus ? "Aktifkan" : "Nonaktifkan"} akun{" "}
                <span className="font-semibold text-ink">{confirmModalData.reporter.name}</span> (
                {confirmModalData.reporter.identifier})?
              </p>
              {!confirmModalData.targetStatus && (
                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700">
                  Akun nonaktif tidak dapat masuk ke portal, dan sesi yang sedang berjalan akan
                  langsung dicabut aksesnya.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 border-t border-line px-6 py-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                disabled={isTogglingStatus}
                className={btnSecondary}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleActive}
                disabled={isTogglingStatus}
                className={
                  confirmModalData.targetStatus
                    ? btnPrimary
                    : "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-300 bg-surface px-4 text-sm font-semibold text-rose-700 transition-colors duration-150 hover:bg-rose-50 disabled:opacity-50"
                }
              >
                {isTogglingStatus
                  ? "Memproses"
                  : confirmModalData.targetStatus
                  ? "Ya, aktifkan"
                  : "Ya, nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
