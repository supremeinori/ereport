"use client";

import { useState, useEffect, useCallback } from "react";

interface Reporter {
  id: string;
  identifier: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    reports: number;
  };
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

  const getCredentialMessage = (name: string, identifier: string, passwordText: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `Selamat siang Bapak/Ibu pimpinan ${name},

Berikut adalah akun resmi untuk pelaporan E-Report PBOBA Sumatera Barat:
• Username : ${identifier}
• Password : ${passwordText}
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

    if (!newIdentifier || !newName || !newEmail || !newPassword) {
      setAddFormError("Semua field wajib diisi.");
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
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kelola Akun Reporter (PBOT)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh entitas pelapor terdaftar di wilayah Sumatera Barat.
          </p>
        </div>
        <button
          onClick={() => {
            setAddFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Akun Reporter
        </button>
      </div>

      {/* Pesan Sukses / Error Notifikasi */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-none bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-none bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-red-600 hover:text-red-900 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Kontrol Pencarian */}
      <div className="bg-white rounded-none border border-slate-200 p-4 mb-6 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama PT atau username/identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-none border border-slate-300 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-none transition-colors"
          >
            Cari
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchReporters("");
              }}
              className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm rounded-none"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Tabel Reporter */}
      <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Memuat data reporter...
          </div>
        ) : reporters.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-medium text-slate-700">
              Belum ada akun reporter terdaftar.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery
                ? "Tidak ada reporter yang cocok dengan pencarian."
                : "Klik tombol 'Tambah Akun Reporter' untuk mendaftarkan PBOT pertama."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Username Login (ID)</th>
                  <th className="px-6 py-3.5">Nama Entitas PBOT</th>
                  <th className="px-6 py-3.5">Email Feedback</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Laporan Masuk</th>
                  <th className="px-6 py-3.5">Terdaftar</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reporters.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      {rep.identifier}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {rep.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {rep.email}
                    </td>
                    <td className="px-6 py-4">
                      {rep.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-none bg-red-500"></span>
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {rep._count?.reports || 0} berkas
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(rep.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const msg = `Selamat siang Bapak/Ibu pimpinan ${rep.name},

Berikut adalah akun resmi untuk pelaporan E-Report PBOBA Sumatera Barat:
• Username : ${rep.identifier}
• Tautan Login : ${window.location.origin}/login

Akun ini digunakan untuk menyampaikan laporan berkas semesteran distribusi obat tradisional (PBOT).

Terima kasih.`;
                            handleCopyText(msg);
                            setSuccessMessage(`Format pesan untuk ${rep.name} berhasil disalin ke clipboard!`);
                          }}
                          title="Salin template pesan untuk PBOT"
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          📋 Salin Pesan
                        </button>

                        {rep.is_active ? (
                          <button
                            onClick={() =>
                              setConfirmModalData({
                                reporter: rep,
                                targetStatus: false,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-none border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
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
                            className="px-3 py-1.5 text-xs font-medium rounded-none border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-none shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                  ✓ Akun Berhasil Dibuat
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Informasi Akses Entitas PBOT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin informasi kredensial ini untuk dibagikan kepada pihak pimpinan entitas pelapor.
                </p>
              </div>
              <button
                onClick={() => setCreatedAccountData(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Kotak Ringkasan Akun */}
            <div className="bg-slate-50 rounded-none p-4 border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Nama PBOT:</span>
                <span className="font-semibold text-slate-900">{createdAccountData.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Username Login:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-none">
                  {createdAccountData.identifier}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Kata Sandi:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-none">
                  {createdAccountData.password}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 text-xs font-medium">Email Feedback:</span>
                <span className="text-slate-700">{createdAccountData.email}</span>
              </div>
            </div>

            {/* Preview Teks Pesan */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Pratinjau Pesan yang Akan Disalin:
              </label>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-none text-xs whitespace-pre-wrap font-sans max-h-40 overflow-y-auto leading-relaxed border border-slate-800">
                {getCredentialMessage(
                  createdAccountData.name,
                  createdAccountData.identifier,
                  createdAccountData.password
                )}
              </pre>
            </div>

            {/* Tombol Copy */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreatedAccountData(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-none text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Selesai / Tutup
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
                className={`w-full sm:w-auto px-5 py-2.5 rounded-none text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Salin Pesan Kredensial (Copy)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Reporter Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-none shadow-xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Pendaftaran Akun Reporter Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {addFormError && (
              <div className="mb-4 p-3.5 rounded-none bg-red-50 border border-red-200 text-xs text-red-700">
                {addFormError}
              </div>
            )}

            <form onSubmit={handleAddReporter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun / Kode Identifier PBOT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. PBOT-PADANG-01"
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
                <span className="text-2xs text-slate-400 mt-1 block">
                  Username ini yang akan digunakan entitas PBOT untuk login.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Badan Usaha / Entitas PBOT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. PT Herbal Mandiri Sejahtera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Korespondensi &amp; Feedback *
                </label>
                <input
                  type="email"
                  required
                  placeholder="pelapor@herbalmandiri.co.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-2xs text-slate-400 mt-1 block">
                  Digunakan untuk feedback evaluasi dan konfirmasi pelaporan (dapat diubah pelapor).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Awal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Minimal 8 karakter (mis. PbotPadang2026!)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-none text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-none text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmittingAdd ? "Menyimpan..." : "Buat Akun & Dapatkan Format Pesan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Aktifkan / Nonaktifkan */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-none shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Konfirmasi {confirmModalData.targetStatus ? "Aktivasi" : "Penonaktifan"} Akun
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin {confirmModalData.targetStatus ? "mengaktifkan" : "menonaktifkan"} akun reporter{" "}
              <strong className="text-slate-800">{confirmModalData.reporter.name}</strong> ({confirmModalData.reporter.identifier})?
              {!confirmModalData.targetStatus && (
                <span className="block mt-2 text-xs text-red-600 font-medium">
                  Perhatian: Akun nonaktif tidak akan dapat login dan sesi aktif yang sedang berjalan akan langsung dicabut aksesnya.
                </span>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                disabled={isTogglingStatus}
                className="px-4 py-2 rounded-none text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleActive}
                disabled={isTogglingStatus}
                className={`px-4 py-2 rounded-none text-sm font-semibold text-white ${
                  confirmModalData.targetStatus
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {isTogglingStatus
                  ? "Memproses..."
                  : confirmModalData.targetStatus
                  ? "Ya, Aktifkan"
                  : "Ya, Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
