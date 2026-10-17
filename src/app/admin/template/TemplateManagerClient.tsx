"use client";

import { useState } from "react";
import TemplateDownloadButton from "@/components/TemplateDownloadButton";

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
      const input = document.getElementById("template-file-input") as HTMLInputElement;
      if (input) input.value = "";
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Template Laporan Resmi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unggah atau perbarui template Excel resmi yang dapat diunduh oleh seluruh entitas pelapor (PBOT).
        </p>
      </div>

      {/* Notifikasi */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm text-purple-900 flex items-center justify-between shadow-xs">
          <span className="font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-purple-700 hover:text-purple-900 font-bold underline">Tutup</button>
        </div>
      )}

      {/* Download Current Template */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Template Aktif Saat Ini</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Template Excel resmi (.xlsx) berstandar E-Report PBOBA dengan formula otomatis Sisa Stok.
            </p>
          </div>
          <TemplateDownloadButton label="Unduh Template Aktif (.xlsx)" variant="primary" />
        </div>

        {/* Struktur Kolom Template Resmi */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Struktur Format Standar (18 Kolom)
            </h3>
            <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Format Terverifikasi
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 text-xs shadow-xs">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white font-semibold">
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">NO</th>
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">NIE</th>
                  <th rowSpan={2} className="border border-purple-700 px-4 py-2">NAMA PRODUK</th>
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">KEMASAN</th>
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">STOK AWAL</th>
                  <th colSpan={2} className="border border-purple-700 px-3 py-1 bg-purple-800">JUMLAH PEMASUKAN</th>
                  <th colSpan={9} className="border border-purple-700 px-3 py-1 bg-purple-800">JUMLAH PENGELUARAN</th>
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">Sisa Stok</th>
                  <th rowSpan={2} className="border border-purple-700 px-3 py-2">HNA</th>
                </tr>
                <tr className="bg-purple-950 text-purple-200 text-2xs font-medium">
                  {/* Pemasukan */}
                  <th className="border border-purple-700 px-2.5 py-1.5">IOT</th>
                  <th className="border border-purple-700 px-2.5 py-1.5">Lainnya</th>
                  {/* Pengeluaran */}
                  <th className="border border-purple-700 px-2 py-1.5">Pedagang eceran</th>
                  <th className="border border-purple-700 px-2 py-1.5">RS</th>
                  <th className="border border-purple-700 px-2 py-1.5">Apotek</th>
                  <th className="border border-purple-700 px-2 py-1.5">Sarana Pemerintah</th>
                  <th className="border border-purple-700 px-2 py-1.5">Puskesmas</th>
                  <th className="border border-purple-700 px-2 py-1.5">Klinik</th>
                  <th className="border border-purple-700 px-2 py-1.5">Toko Obat</th>
                  <th className="border border-purple-700 px-2 py-1.5">Retur</th>
                  <th className="border border-purple-700 px-2 py-1.5">Lainnya</th>
                </tr>
              </thead>
              <tbody className="bg-slate-50 text-slate-600 font-mono text-2xs">
                <tr>
                  <td className="border border-slate-200 px-2 py-2 text-slate-400">1..30</td>
                  <td className="border border-slate-200 px-2 py-2">TR...</td>
                  <td className="border border-slate-200 px-3 py-2 text-left font-sans font-semibold text-slate-800">Nama Obat Herbal</td>
                  <td className="border border-slate-200 px-2 py-2 text-left font-sans">Dus, botol</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">0</td>
                  <td className="border border-slate-200 px-2 py-2 text-right font-bold text-purple-700 bg-purple-50/60">=E+Pemasukan-Pengeluaran</td>
                  <td className="border border-slate-200 px-2 py-2 text-right font-sans">Rp...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-2xs text-slate-500 mt-2.5">
            * Kolom <strong>Sisa Stok</strong> dihitung otomatis oleh formula Excel. Bagian bawah tabel dilengkapi kolom tanda tangan resmi Penanggung Jawab PBOT & nomor SIPTTK/STRA.
          </p>
        </div>
      </div>

      {/* Upload New Template */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Perbarui Template Resmi</h2>
        <p className="text-sm text-slate-600 mb-5">
          Unggah berkas Excel (.xlsx) baru untuk menggantikan template resmi yang aktif. Template lama akan langsung digantikan.
        </p>

        {uploadError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUploadTemplate} className="space-y-5">
          <div className="flex justify-center px-6 pt-6 pb-7 border-2 border-purple-200/80 border-dashed rounded-2xl hover:border-purple-400 transition-colors bg-purple-50/20">
            <div className="space-y-2 text-center">
              <svg className="mx-auto h-12 w-12 text-purple-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 justify-center">
                <label htmlFor="template-file-input" className="cursor-pointer font-bold text-purple-700 hover:text-purple-800 px-3 py-1.5 border border-purple-200 bg-white rounded-xl shadow-xs transition-all hover:bg-purple-50">
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
              <p className="text-xs text-slate-400">Format .xlsx, maksimum 20 MB</p>
              {selectedFile && (
                <p className="text-xs font-semibold text-purple-800 bg-purple-50 px-3.5 py-1 rounded-full inline-block border border-purple-200 shadow-xs">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-purple-500/25 transition-all"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Mengunggah...
                </>
              ) : (
                "Simpan Template Baru"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
