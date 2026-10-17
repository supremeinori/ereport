"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DownloadButton from "@/components/DownloadButton";
import TemplateDownloadButton from "@/components/TemplateDownloadButton";

interface ReportItem {
  id: string;
  period_year: number;
  period_semester: number;
  original_filename: string;
  uploaded_at: string;
  status: "pending_review" | "reviewed" | "revision_required";
  reviewed_at?: string | null;
}

export default function ReportsClient() {
  const currentYear = new Date().getFullYear();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showColumnGuide, setShowColumnGuide] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/reporter/reports");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat riwayat laporan.");
      }
      setReports(data.reports || []);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Cek apakah periode yang dipilih sudah ada laporan tersimpan
  const existingReportForPeriod = useMemo(() => {
    return reports.find(
      (r) => r.period_year === selectedYear && r.period_semester === selectedSemester
    );
  }, [reports, selectedYear, selectedSemester]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadError("Format berkas harus berekstensi .xlsx resmi.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran berkas tidak boleh melebihi batas 10 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      setUploadError("Silakan pilih berkas Excel (.xlsx) yang sudah diisi.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("period_year", selectedYear.toString());
      formData.append("period_semester", selectedSemester.toString());

      const res = await fetch("/api/reporter/reports/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengunggah laporan.");
      }

      setSuccessMessage(data.message);
      setSelectedFile(null);
      // Reset file input element
      const fileInput = document.getElementById("report-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh riwayat laporan
      fetchReports();
    } catch (err: unknown) {
      const error = err as Error;
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Telah Diperiksa
          </span>
        );
      case "revision_required":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Perlu Revisi
          </span>
        );
      case "pending_review":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Menunggu Pemeriksaan
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Judul & Deskripsi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Pelaporan Berkala Semesteran
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pelaporan Distribusi Obat Tradisional
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kirimkan berkas laporan semesteran resmi dalam format Excel (.xlsx) sesuai standar BPOM.
          </p>
        </div>
      </div>

      {/* Instruksi Pelaporan (FR-REP-03) */}
      <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 border border-purple-200/70 rounded-2xl p-5 sm:p-6 text-sm text-purple-950 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="font-bold text-purple-950 text-base">Petunjuk Pengisian &amp; Ketentuan Pengunggahan:</h3>
            <ul className="list-disc list-inside space-y-1 text-purple-900 text-xs sm:text-sm">
              <li>Pastikan laporan menggunakan template resmi Excel yang telah diisi lengkap.</li>
              <li>Sistem hanya menerima berkas berformat <strong>.xlsx</strong> dengan ukuran maksimum <strong>10 MB</strong>. Berkas dengan makro (.xlsm) akan ditolak.</li>
              <li>Pilih periode tahun dan semester yang sesuai dengan masa pelaporan.</li>
              <li>Jika Anda mengunggah ulang untuk periode yang sama, berkas laporan baru akan secara aman menggantikan berkas sebelumnya dan status akan kembali menjadi <em>Menunggu Pemeriksaan</em>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unduh Template Resmi (FR-REP-04) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Template Laporan Resmi (.xlsx)</h3>
              <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Format Standar E-Report PBOBA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unduh template Excel resmi. Laporan mencakup 18 kolom terstandarisasi dengan formula perhitungan otomatis.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowColumnGuide(!showColumnGuide)}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-purple-50/50 hover:border-purple-200 transition-all shadow-2xs"
            >
              {showColumnGuide ? "Sembunyikan Format" : "Lihat Format Kolom"}
            </button>
            <TemplateDownloadButton label="Unduh Template (.xlsx)" variant="primary" />
          </div>
        </div>

        {/* Tabel Panduan Kolom Resmi */}
        {showColumnGuide && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in duration-200">
            <div className="overflow-x-auto rounded-xl border border-purple-200/80 text-xs shadow-sm">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white font-semibold">
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">NO</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">NIE</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-4 py-2">NAMA PRODUK</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">KEMASAN</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">STOK AWAL</th>
                    <th colSpan={2} className="border border-purple-800/60 px-3 py-1 bg-purple-800/70">JUMLAH PEMASUKAN</th>
                    <th colSpan={9} className="border border-purple-800/60 px-3 py-1 bg-purple-800/70">JUMLAH PENGELUARAN</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">Sisa Stok</th>
                    <th rowSpan={2} className="border border-purple-800/60 px-3 py-2">HNA</th>
                  </tr>
                  <tr className="bg-purple-950 text-purple-200 text-2xs font-medium">
                    <th className="border border-purple-800/60 px-2.5 py-1.5">IOT</th>
                    <th className="border border-purple-800/60 px-2.5 py-1.5">Lainnya</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Pedagang eceran</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">RS</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Apotek</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Sarana Pemerintah</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Puskesmas</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Klinik</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Toko Obat</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Retur</th>
                    <th className="border border-purple-800/60 px-2 py-1.5">Lainnya</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-50/50 text-slate-600 font-mono text-2xs">
                  <tr>
                    <td className="border border-slate-200 px-2 py-2 text-slate-400">1..n</td>
                    <td className="border border-slate-200 px-2 py-2">TR...</td>
                    <td className="border border-slate-200 px-3 py-2 text-left">Nama Produk</td>
                    <td className="border border-slate-200 px-2 py-2 text-left">Kemasan</td>
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
                    <td className="border border-slate-200 px-2 py-2 text-right font-bold text-purple-700 bg-purple-50/60">Otomatis</td>
                    <td className="border border-slate-200 px-2 py-2 text-right">Rp...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-2xs text-slate-500 mt-2">
              💡 Catatan: Kolom <strong>Sisa Stok</strong> dihitung otomatis oleh Excel dari: <code>Stok Awal + Pemasukan - Pengeluaran</code>. Bagian bawah tabel wajib ditandatangani oleh <strong>Penanggung Jawab PBOT</strong> beserta nomor registrasi tenaga kefarmasian (SIPTTK / STRA).
            </p>
          </div>
        )}
      </div>

      {/* Alert Notifikasi Global */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-sm text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100/50 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-sm text-rose-800 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-100/50 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Unggah Laporan (FR-REP-05, FR-REP-06) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Formulir Unggah Laporan Semester
            </h2>
            <p className="text-xs text-slate-500">Pilih periode pelaporan dan unggah berkas excel yang valid</p>
          </div>
        </div>

        {uploadError && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 flex items-start gap-2 shadow-sm">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pilihan Tahun */}
            <div>
              <label htmlFor="period_year" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahun Pelaporan *
              </label>
              <select
                id="period_year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              >
                {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilihan Semester */}
            <div>
              <label htmlFor="period_semester" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester Pelaporan *
              </label>
              <select
                id="period_semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              >
                <option value={1}>Semester 1 (Januari – Juni)</option>
                <option value={2}>Semester 2 (Juli – Desember)</option>
              </select>
            </div>
          </div>

          {/* Indikator apakah periode ini sudah ada */}
          {existingReportForPeriod && (
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-amber-950">
                  Laporan untuk Tahun {selectedYear} Semester {selectedSemester} sudah pernah diunggah (<em>{existingReportForPeriod.original_filename}</em>).
                </p>
                <p className="mt-1 text-amber-800">
                  Mengunggah berkas baru sekarang akan menggantikan laporan sebelumnya dan mereset status pemeriksaan kembali menjadi <em>Menunggu Pemeriksaan</em>.
                </p>
              </div>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Berkas Laporan Excel (.xlsx) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-7 pb-8 border-2 border-purple-200 border-dashed rounded-2xl hover:border-purple-400 transition-colors bg-purple-50/20 hover:bg-purple-50/40">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-600">
                  <label htmlFor="report-file-input" className="relative cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-xs px-4 py-2 hover:from-purple-500 hover:to-indigo-500 shadow-sm shadow-purple-500/20 transition-all focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
                    <span>Pilih Berkas Excel</span>
                    <input
                      id="report-file-input"
                      name="file"
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-xs text-slate-500">atau letakkan berkas di sini</span>
                </div>
                <p className="text-2xs text-slate-400">
                  Format resmi .xlsx standar e-report, maksimum 10 MB
                </p>
                {selectedFile && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-100/80 py-1.5 px-3.5 rounded-full border border-purple-200">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Mengunggah Berkas...</span>
                </>
              ) : existingReportForPeriod ? (
                "Perbarui / Ganti Laporan"
              ) : (
                "Unggah Laporan"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Riwayat Laporan (FR-REP-07, UI-04, UI-08) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Laporan Semester Entitas
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {reports.length} Laporan
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <svg className="animate-spin h-6 w-6 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Memuat riwayat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Belum ada laporan semester yang diunggah</h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan formulir di atas untuk mengunggah laporan semesteran pertama entitas Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-purple-100 text-xs font-semibold uppercase tracking-wider border-b border-purple-800">
                <tr>
                  <th className="px-6 py-3.5">Periode Pelaporan</th>
                  <th className="px-6 py-3.5">Nama Berkas Asli</th>
                  <th className="px-6 py-3.5">Waktu Unggah (WIB)</th>
                  <th className="px-6 py-3.5">Status Pemeriksaan</th>
                  <th className="px-6 py-3.5">Waktu Diperiksa</th>
                  <th className="px-6 py-3.5 text-right">Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      Tahun {item.period_year} — Semester {item.period_semester}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-xs">
                      {item.original_filename}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {new Date(item.uploaded_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                      })}{" "}
                      WIB
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {item.reviewed_at
                        ? `${new Date(item.reviewed_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DownloadButton
                        reportId={item.id}
                        filename={item.original_filename}
                        label="Unduh"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
