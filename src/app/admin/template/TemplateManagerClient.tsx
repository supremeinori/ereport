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
        <h1 className="text-2xl font-bold text-slate-900">Kelola Template Laporan Resmi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unggah atau perbarui template Excel resmi yang dapat diunduh oleh seluruh entitas pelapor (PBOT).
        </p>
      </div>

      {/* Notifikasi */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between">
          <span className="font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-emerald-600 font-semibold">Tutup</button>
        </div>
      )}

      {/* Download Current Template */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Template Aktif Saat Ini</h2>
        <p className="text-sm text-slate-600 mb-5">
          Pratinjau dan unduh versi template resmi yang sedang aktif digunakan oleh pelapor.
        </p>
        <TemplateDownloadButton label="Unduh Template Aktif" variant="secondary" />
      </div>

      {/* Upload New Template */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Perbarui Template Resmi</h2>
        <p className="text-sm text-slate-600 mb-5">
          Unggah berkas Excel (.xlsx) baru untuk menggantikan template resmi yang aktif. Template lama akan langsung digantikan.
        </p>

        {uploadError && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUploadTemplate} className="space-y-5">
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-emerald-400 transition-colors bg-slate-50/50">
            <div className="space-y-2 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 justify-center">
                <label htmlFor="template-file-input" className="cursor-pointer font-semibold text-emerald-600 hover:text-emerald-500 px-2 py-0.5 border border-slate-200 bg-white rounded-md">
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
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm transition-colors"
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
