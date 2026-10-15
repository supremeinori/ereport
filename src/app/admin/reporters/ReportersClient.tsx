"use client";

import { useState, useEffect, useCallback } from "react";

interface Reporter {
  id: string;
  identifier: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    reports: number;
  };
}

export default function ReportersClient() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Tambah Reporter
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

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
          identifier: newIdentifier,
          name: newName,
          email: newEmail,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat akun reporter.");
      }

      setSuccessMessage(`Akun ${data.reporter.identifier} berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      // Reset form
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
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Reporter Baru
        </button>
      </div>

      {/* Alert Notifikasi */}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter / Search Bar (FR-ADM-06) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari berdasarkan nama entitas, kode identifier, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
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
              className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-800"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Tabel Reporter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <svg
              className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Memuat data reporter...
          </div>
        ) : reporters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Tidak ada entitas reporter ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? "Coba ubah kata kunci pencarian Anda."
                : "Klik tombol 'Tambah Reporter Baru' di atas untuk membuat akun."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Identifier</th>
                  <th className="px-6 py-3.5">Nama Entitas PBOT</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Status Akun</th>
                  <th className="px-6 py-3.5">Laporan</th>
                  <th className="px-6 py-3.5">Terdaftar</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reporters.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                      {rep.identifier}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{rep.name}</td>
                    <td className="px-6 py-4 text-slate-600">{rep.email}</td>
                    <td className="px-6 py-4">
                      {rep.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {rep._count?.reports || 0} file
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(rep.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rep.is_active ? (
                        <button
                          onClick={() =>
                            setConfirmModalData({
                              reporter: rep,
                              targetStatus: false,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
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
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Reporter Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6">
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
              <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {addFormError}
              </div>
            )}

            <form onSubmit={handleAddReporter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Identifier Unik PBOT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mis. PBOT-PADANG-01"
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
                <span className="text-2xs text-slate-400 mt-1 block">
                  Identifier akan dikonversi ke huruf besar secara otomatis.
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Pelapor *
                </label>
                <input
                  type="email"
                  required
                  placeholder="pelapor@herbalmandiri.co.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Awal *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmittingAdd ? "Menyimpan..." : "Buat Akun Reporter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Aktifkan / Nonaktifkan (FR-ADM-08, UI-05) */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
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
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleActive}
                disabled={isTogglingStatus}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${
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
