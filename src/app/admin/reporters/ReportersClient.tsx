"use client";

import { useState, useEffect, useCallback } from "react";
import {
  badge,
  btnPrimary,
  btnSecondary,
  input,
  textarea,
  label,
  panel,
} from "@/components/ui";
import { formatDateUtc, formatDateInput } from "@/lib/date-utils";

interface Reporter {
  id: string;
  identifier: string;
  name: string;
  email: string | null;
  role?: string;
  is_active: boolean;
  address?: string | null;
  license_number?: string | null;
  license_date?: string | null;
  pic_name?: string | null;
  pic_phone?: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string;
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

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
  const [newAddress, setNewAddress] = useState("");
  const [newLicenseNumber, setNewLicenseNumber] = useState("");
  const [newLicenseDate, setNewLicenseDate] = useState("");
  const [newPicName, setNewPicName] = useState("");
  const [newPicPhone, setNewPicPhone] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Modal Edit / Detail Reporter
  const [editingReporter, setEditingReporter] = useState<Reporter | null>(null);
  const [editIdentifier, setEditIdentifier] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editLicenseNumber, setEditLicenseNumber] = useState("");
  const [editLicenseDate, setEditLicenseDate] = useState("");
  const [editPicName, setEditPicName] = useState("");
  const [editPicPhone, setEditPicPhone] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Modal Sukses & Salin Kredensial Akun Baru
  const [createdAccountData, setCreatedAccountData] = useState<{
    name: string;
    identifier: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const loginUrl =
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1")
        ? `${window.location.origin}/login`
        : "https://ereport-rho.vercel.app/login";

    const pwd = passwordText && passwordText.trim() ? passwordText.trim() : "12345678";

    return `Selamat siang Bapak/Ibu pimpinan ${name},

Berikut adalah akun resmi untuk pelaporan E-Report PBOBA Sumatera Barat:
• Username : ${identifier}
• Password : ${pwd}
• Tautan Login : ${loginUrl}

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

  const resetAddForm = () => {
    setNewIdentifier("");
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewAddress("");
    setNewLicenseNumber("");
    setNewLicenseDate("");
    setNewPicName("");
    setNewPicPhone("");
    setNewDescription("");
    setAddFormError(null);
  };

  const handleAddReporter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!newIdentifier || !newName || !newPassword) {
      setAddFormError("Username/identifier, nama entitas, dan kata sandi awal wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setAddFormError("Kata sandi awal minimal 8 karakter.");
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
          email: newEmail.trim() || undefined,
          password: newPassword,
          address: newAddress.trim() || undefined,
          license_number: newLicenseNumber.trim() || undefined,
          license_date: newLicenseDate || undefined,
          pic_name: newPicName.trim() || undefined,
          pic_phone: newPicPhone.trim() || undefined,
          description: newDescription.trim() || undefined,
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
      resetAddForm();
      fetchReporters(searchQuery);
    } catch (err: unknown) {
      const error = err as Error;
      setAddFormError(error.message);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openEditModal = (reporter: Reporter) => {
    setEditingReporter(reporter);
    setEditIdentifier(reporter.identifier || "");
    setEditName(reporter.name || "");
    setEditEmail(reporter.email || "");
    setEditPassword("");
    setEditAddress(reporter.address || "");
    setEditLicenseNumber(reporter.license_number || "");
    setEditLicenseDate(formatDateInput(reporter.license_date));
    setEditPicName(reporter.pic_name || "");
    setEditPicPhone(reporter.pic_phone || "");
    setEditDescription(reporter.description || "");
    setEditIsActive(reporter.is_active);
    setEditFormError(null);
  };

  const handleEditReporter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReporter) return;

    setEditFormError(null);

    if (!editIdentifier.trim() || !editName.trim()) {
      setEditFormError("Username/identifier dan nama entitas wajib diisi.");
      return;
    }

    if (editPassword && editPassword.length < 8) {
      setEditFormError("Kata sandi baru minimal 8 karakter jika ingin diubah.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/admin/reporters/${editingReporter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: editIdentifier.trim(),
          name: editName.trim(),
          email: editEmail.trim() || null,
          password: editPassword.trim() ? editPassword : undefined,
          address: editAddress.trim() || null,
          license_number: editLicenseNumber.trim() || null,
          license_date: editLicenseDate || null,
          pic_name: editPicName.trim() || null,
          pic_phone: editPicPhone.trim() || null,
          description: editDescription.trim() || null,
          is_active: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui data akun.");
      }

      setSuccessMessage(data.message || "Detail akun entitas berhasil diperbarui.");
      setEditingReporter(null);
      fetchReporters(searchQuery);
    } catch (err: unknown) {
      const error = err as Error;
      setEditFormError(error.message);
    } finally {
      setIsSubmittingEdit(false);
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
            Daftar seluruh entitas pedagang besar obat tradisional (PBOT) yang terdaftar di wilayah Sumatera Barat.
          </p>
        </div>
        <button
          onClick={() => {
            resetAddForm();
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
              placeholder="Cari nama badan usaha, username, nomor izin, atau nama PIC"
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
            <table className="w-full min-w-[56rem] text-left">
              <thead className="border-b border-line bg-canvas">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Username login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Nama badan usaha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Nomor &amp; tgl izin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Penanggung jawab (PIC)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    Berkas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reporters.map((rep) => (
                  <tr key={rep.id} className="transition-colors duration-150 hover:bg-purple-50/40">
                    <td className="px-4 py-3 align-middle">
                      <span className="font-mono text-xs font-semibold text-purple-900">
                        {rep.identifier}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-sm font-medium text-ink">{rep.name}</div>
                      <div className="text-xs text-ink-soft">
                        {rep.email || <span className="text-ink-soft/50">Email belum diisi</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="font-mono text-xs text-ink">
                        {rep.license_number || <span className="text-ink-soft/60">-</span>}
                      </div>
                      <div className="text-2xs text-ink-soft">
                        {rep.license_date ? formatDateUtc(rep.license_date) : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-xs font-medium text-ink">
                        {rep.pic_name || <span className="text-ink-soft/60">-</span>}
                      </div>
                      <div className="font-mono text-2xs text-ink-soft">
                        {rep.pic_phone || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
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
                    <td className="tabular px-4 py-3 text-xs text-ink-soft align-middle">
                      {rep._count?.reports || 0} berkas
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(rep)}
                          title="Lihat & edit detail entitas"
                          className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          Detail &amp; Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const msg = getCredentialMessage(rep.name, rep.identifier);
                            handleCopyText(msg);
                            setCopiedId(rep.id);
                            setTimeout(() => setCopiedId(null), 2500);
                            setSuccessMessage(`Format pesan kredensial untuk ${rep.name} berhasil disalin!`);
                          }}
                          title="Salin kredensial untuk reporter"
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                            copiedId === rep.id
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                              : "border-line-strong text-ink-soft hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900"
                          }`}
                        >
                          {copiedId === rep.id ? (
                            <>
                              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Tersalin
                            </>
                          ) : (
                            <>
                              <CopyIcon className="h-3.5 w-3.5" />
                              Salin
                            </>
                          )}
                        </button>

                        {rep.is_active ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModalData({
                                reporter: rep,
                                targetStatus: false,
                              })
                            }
                            title="Nonaktifkan akun"
                            className="rounded-md border border-rose-200 px-2 py-1.5 text-xs font-semibold text-rose-700 transition-colors duration-150 hover:bg-rose-50"
                          >
                            Nonaktifkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModalData({
                                reporter: rep,
                                targetStatus: true,
                              })
                            }
                            title="Aktifkan akun"
                            className="rounded-md border border-emerald-300 px-2 py-1.5 text-xs font-semibold text-emerald-700 transition-colors duration-150 hover:bg-emerald-50"
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
                  <dt className="text-xs text-ink-soft">Kata sandi awal</dt>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-reporter-title"
            className="my-8 w-full max-w-2xl rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="border-b border-line px-6 py-4">
              <h3 id="add-reporter-title" className="text-base font-bold text-ink">
                Pendaftaran akun entitas PBOT baru
              </h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Lengkapi kredensial akses dan profil izin entitas PBOT sesuai ketentuan yang berlaku.
              </p>
            </div>

            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              {addFormError && (
                <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700" role="alert">
                  {addFormError}
                </div>
              )}

              <form onSubmit={handleAddReporter} className="space-y-6">
                {/* Bagian 1: Kredensial Akses Portal */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    1. Kredensial Akses Portal
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="new-identifier">
                        Username / Identifier login
                        <span className="text-rose-600"> *</span>
                      </label>
                      <input
                        id="new-identifier"
                        type="text"
                        required
                        placeholder="Contoh: pt1 atau PBOT-SOLOK"
                        value={newIdentifier}
                        onChange={(e) => setNewIdentifier(e.target.value)}
                        className={`${input} font-mono`}
                      />
                      <p className="mt-1 text-2xs text-ink-soft">
                        Identifier unik yang digunakan entitas untuk masuk ke sistem.
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
                      <p className="mt-1 text-2xs text-ink-soft">
                        Disimpan aman menggunakan enkripsi hash bcrypt.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="new-name">
                        Nama badan usaha / PT
                        <span className="text-rose-600"> *</span>
                      </label>
                      <input
                        id="new-name"
                        type="text"
                        required
                        placeholder="Contoh: PT BUKITTINGGI MANDIRI SEJAHTERA"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="new-email">
                        Email korespondensi (opsional)
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
                        Alamat email untuk notifikasi evaluasi berkas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Profil & Perizinan PBOT */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    2. Data Perizinan &amp; Alamat
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="new-license-number">
                        Nomor izin PBOT
                      </label>
                      <input
                        id="new-license-number"
                        type="text"
                        placeholder="Nomor izin peredaran PBOT"
                        value={newLicenseNumber}
                        onChange={(e) => setNewLicenseNumber(e.target.value)}
                        className={`${input} font-mono text-xs`}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="new-license-date">
                        Tanggal terbit izin
                      </label>
                      <input
                        id="new-license-date"
                        type="date"
                        value={newLicenseDate}
                        onChange={(e) => setNewLicenseDate(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="new-address">
                        Alamat lengkap kantor / gudang
                      </label>
                      <textarea
                        id="new-address"
                        rows={2}
                        placeholder="Alamat jalan, kelurahan, kecamatan, kota/kabupaten..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className={textarea}
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Penanggung Jawab & Keterangan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    3. Penanggung Jawab (PIC) &amp; Keterangan
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="new-pic-name">
                        Nama PIC / Penanggung jawab teknis
                      </label>
                      <input
                        id="new-pic-name"
                        type="text"
                        placeholder="Contoh: Lupia Rahmadani, S.Farm"
                        value={newPicName}
                        onChange={(e) => setNewPicName(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="new-pic-phone">
                        Nomor HP / WhatsApp PIC
                      </label>
                      <input
                        id="new-pic-phone"
                        type="text"
                        placeholder="Contoh: 081378911852"
                        value={newPicPhone}
                        onChange={(e) => setNewPicPhone(e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="new-description">
                        Keterangan / Catatan tambahan
                      </label>
                      <textarea
                        id="new-description"
                        rows={2}
                        placeholder="Catatan administratif perizinan atau catatan khusus..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className={textarea}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-line pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetAddForm();
                    }}
                    disabled={isSubmittingAdd}
                    className={btnSecondary}
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingAdd} className={btnPrimary}>
                    {isSubmittingAdd ? "Menyimpan akun..." : "Buat akun entitas"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit / Detail Akun Entitas */}
      {editingReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-reporter-title"
            className="my-8 w-full max-w-2xl rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 id="edit-reporter-title" className="text-base font-bold text-ink">
                  Detail &amp; Edit Akun Entitas PBOT
                </h3>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Perbarui profil perizinan, status aktif, kontak PIC, atau reset kata sandi akun.
                </p>
              </div>
              <span
                className={`${badge} ${
                  editIsActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {editIsActive ? "Akun Aktif" : "Akun Nonaktif"}
              </span>
            </div>

            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              {editFormError && (
                <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700" role="alert">
                  {editFormError}
                </div>
              )}

              <form onSubmit={handleEditReporter} className="space-y-6">
                {/* Ringkasan Meta */}
                <div className="grid grid-cols-2 gap-3 rounded-md border border-line bg-canvas p-3 text-xs">
                  <div>
                    <span className="text-ink-soft">Jumlah Berkas Masuk: </span>
                    <strong className="text-ink">{editingReporter._count?.reports || 0} berkas</strong>
                  </div>
                  <div>
                    <span className="text-ink-soft">Terdaftar Sejak: </span>
                    <span className="text-ink">
                      {new Date(editingReporter.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Bagian 1: Kredensial Akses & Status */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    1. Akses &amp; Status Akun
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="edit-identifier">
                        Username login (identifier)
                        <span className="text-rose-600"> *</span>
                      </label>
                      <input
                        id="edit-identifier"
                        type="text"
                        required
                        value={editIdentifier}
                        onChange={(e) => setEditIdentifier(e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="edit-active-status">
                        Status akun entitas
                      </label>
                      <select
                        id="edit-active-status"
                        value={editIsActive ? "active" : "inactive"}
                        onChange={(e) => setEditIsActive(e.target.value === "active")}
                        className={input}
                      >
                        <option value="active">Aktif (Dapat Login &amp; Mengirim Berkas)</option>
                        <option value="inactive">Nonaktif (Akses Masuk Dicabut)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="edit-password">
                        Reset kata sandi (opsional)
                      </label>
                      <input
                        id="edit-password"
                        type="text"
                        placeholder="Kosongkan jika tidak ingin mengganti kata sandi"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className={`${input} font-mono`}
                      />
                      <p className="mt-1 text-2xs text-ink-soft">
                        Isi hanya jika admin ingin menetapkan kata sandi baru untuk entitas (minimal 8 karakter).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Profil Badan Usaha & Perizinan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    2. Data Perizinan &amp; Alamat
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="edit-name">
                        Nama badan usaha / PT
                        <span className="text-rose-600"> *</span>
                      </label>
                      <input
                        id="edit-name"
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="edit-license-number">
                        Nomor izin PBOT
                      </label>
                      <input
                        id="edit-license-number"
                        type="text"
                        placeholder="Nomor izin PBOT"
                        value={editLicenseNumber}
                        onChange={(e) => setEditLicenseNumber(e.target.value)}
                        className={`${input} font-mono text-xs`}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="edit-license-date">
                        Tanggal terbit izin
                      </label>
                      <input
                        id="edit-license-date"
                        type="date"
                        value={editLicenseDate}
                        onChange={(e) => setEditLicenseDate(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="edit-email">
                        Email korespondensi resmi (opsional)
                      </label>
                      <input
                        id="edit-email"
                        type="email"
                        placeholder="nama@entitas.co.id"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="edit-address">
                        Alamat lengkap kantor / gudang
                      </label>
                      <textarea
                        id="edit-address"
                        rows={2}
                        placeholder="Alamat kantor atau sarana distribusi..."
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className={textarea}
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Penanggung Jawab & Keterangan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-line pb-1.5 mb-3">
                    3. Penanggung Jawab (PIC) &amp; Catatan
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="edit-pic-name">
                        Nama PIC / Penanggung jawab teknis
                      </label>
                      <input
                        id="edit-pic-name"
                        type="text"
                        placeholder="Nama penanggung jawab teknis"
                        value={editPicName}
                        onChange={(e) => setEditPicName(e.target.value)}
                        className={input}
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="edit-pic-phone">
                        Nomor HP / WhatsApp PIC
                      </label>
                      <input
                        id="edit-pic-phone"
                        type="text"
                        placeholder="Nomor kontak aktif"
                        value={editPicPhone}
                        onChange={(e) => setEditPicPhone(e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="edit-description">
                        Keterangan administratif
                      </label>
                      <textarea
                        id="edit-description"
                        rows={2}
                        placeholder="Catatan dari petugas Dinkes atau verifikator..."
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className={textarea}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-line pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingReporter(null)}
                    disabled={isSubmittingEdit}
                    className={btnSecondary}
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingEdit} className={btnPrimary}>
                    {isSubmittingEdit ? "Menyimpan perubahan..." : "Simpan perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Aktifkan / Nonaktifkan Cepat */}
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
