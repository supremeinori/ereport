"use client";

import { useState } from "react";
import TemplateDownloadButton from "@/components/TemplateDownloadButton";
import { btnPrimary, btnSecondary, pageSubtitle, pageTitle, panel } from "@/components/ui";

export default function TemplateManagerClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadError("Template harus berformat .xlsx");
      setSelectedFile(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("Ukuran template tidak boleh melebihi 20 MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      setUploadError("Silakan pilih berkas template terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/template/download", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengunggah template.");

      setSuccessMessage(`Template berhasil diperbarui: ${data.filename}`);
      setSelectedFile(null);
      const inputEl = document.getElementById("template-file-input") as HTMLInputElement;
      if (inputEl) inputEl.value = "";
    } catch (err: unknown) {
      const e = err as Error;
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageTitle}>Kelola Template Laporan Resmi</h1>
        <p className={pageSubtitle}>
          Unggah atau perbarui template Excel resmi yang dapat diunduh oleh seluruh entitas pelapor (PBOT).
        </p>
      </div>

      {/* Notifikasi Sukses */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
          <span className="font-medium">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Download Current Template */}
      <div className={panel}>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Template Aktif Saat Ini</h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                Template Excel resmi (.xlsx) berstandar E-Report PBOBA dengan formula otomatis Sisa Stok.
              </p>
            </div>
            <TemplateDownloadButton label="Unduh Template Aktif (.xlsx)" variant="primary" />
          </div>

          {/* Struktur Kolom Template Resmi */}
          <div className="mt-6 border-t border-line pt-5">
            <h3 className="mb-3 text-xs font-semibold text-ink-soft">
              Struktur Format Standar (18 Kolom)
            </h3>

            <div className="overflow-x-auto rounded-md border border-line text-xs">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-purple-950 text-white font-semibold">
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">NO</th>
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">NIE</th>
                    <th rowSpan={2} className="border border-purple-800 px-4 py-2">NAMA PRODUK</th>
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">KEMASAN</th>
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">STOK AWAL</th>
                    <th colSpan={2} className="border border-purple-800 px-3 py-1 bg-purple-900">JUMLAH PEMASUKAN</th>
                    <th colSpan={9} className="border border-purple-800 px-3 py-1 bg-purple-900">JUMLAH PENGELUARAN</th>
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">Sisa Stok</th>
                    <th rowSpan={2} className="border border-purple-800 px-3 py-2">HNA</th>
                  </tr>
                  <tr className="bg-purple-900 text-purple-100 text-2xs font-medium">
                    {/* Pemasukan */}
                    <th className="border border-purple-800 px-2.5 py-1.5">IOT</th>
                    <th className="border border-purple-800 px-2.5 py-1.5">Lainnya</th>
                    {/* Pengeluaran */}
                    <th className="border border-purple-800 px-2 py-1.5">Pedagang eceran</th>
                    <th className="border border-purple-800 px-2 py-1.5">RS</th>
                    <th className="border border-purple-800 px-2 py-1.5">Apotek</th>
                    <th className="border border-purple-800 px-2 py-1.5">Sarana Pemerintah</th>
                    <th className="border border-purple-800 px-2 py-1.5">Puskesmas</th>
                    <th className="border border-purple-800 px-2 py-1.5">Klinik</th>
                    <th className="border border-purple-800 px-2 py-1.5">Toko Obat</th>
                    <th className="border border-purple-800 px-2 py-1.5">Retur</th>
                    <th className="border border-purple-800 px-2 py-1.5">Lainnya</th>
                  </tr>
                </thead>
                <tbody className="bg-surface text-ink-soft font-mono text-2xs">
                  <tr>
                    <td className="border border-line px-2 py-2 text-ink-soft/60">1..30</td>
                    <td className="border border-line px-2 py-2">TR...</td>
                    <td className="border border-line px-3 py-2 text-left font-sans font-semibold text-ink">Nama Obat Herbal</td>
                    <td className="border border-line px-2 py-2 text-left font-sans">Dus, botol</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right">0</td>
                    <td className="border border-line px-2 py-2 text-right font-bold text-purple-700 bg-purple-50">=E+Pemasukan-Pengeluaran</td>
                    <td className="border border-line px-2 py-2 text-right font-sans">Rp...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2.5 text-2xs text-ink-soft">
              Kolom <strong>Sisa Stok</strong> dihitung otomatis oleh formula Excel. Bagian bawah tabel dilengkapi kolom tanda tangan resmi Penanggung Jawab PBOT &amp; nomor SIPTTK/STRA.
            </p>
          </div>
        </div>
      </div>

      {/* Upload New Template */}
      <div className={panel}>
        <div className="p-6">
          <h2 className="text-base font-bold text-ink">Perbarui Template Resmi</h2>
          <p className="mt-0.5 mb-5 text-sm text-ink-soft">
            Unggah berkas Excel (.xlsx) baru untuk menggantikan template resmi yang aktif. Template lama akan langsung digantikan.
          </p>

          {uploadError && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUploadTemplate} className="space-y-5">
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-line-strong bg-canvas p-6 transition-colors hover:border-purple-600">
              <div className="space-y-2 text-center">
                <svg className="mx-auto h-10 w-10 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                <div className="flex justify-center text-sm">
                  <label htmlFor="template-file-input" className={btnSecondary}>
                    <span>Pilih Berkas Template</span>
                    <input
                      id="template-file-input"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-ink-soft">Format .xlsx, maksimum 20 MB</p>
                {selectedFile && (
                  <p className="inline-flex items-center gap-1.5 rounded-sm border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-mono text-purple-900">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className={btnPrimary}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  "Simpan Template Baru"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}