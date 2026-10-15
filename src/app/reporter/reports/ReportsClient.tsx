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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
            Telah Diperiksa
          </span>
        );
      case "revision_required":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-none bg-red-500"></span>
            Perlu Revisi
          </span>
        );
      case "pending_review":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-none bg-amber-500"></span>
            Menunggu Pemeriksaan
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Judul & Deskripsi */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pelaporan Distribusi Obat Tradisional
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kirimkan berkas laporan semesteran resmi dalam format Excel (.xlsx).
        </p>
      </div>

      {/* Instruksi Pelaporan (FR-REP-03) */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-none p-5 sm:p-6 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1.5">
            <h3 className="font-bold text-blue-950">Petunjuk Pengisian & Ketentuan Pengunggahan:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs sm:text-sm">
              <li>Pastikan laporan menggunakan template resmi Excel yang telah diisi lengkap.</li>
              <li>Sistem hanya menerima berkas berformat <strong>.xlsx</strong> dengan ukuran maksimum <strong>10 MB</strong>. Berkas dengan makro (.xlsm) akan ditolak.</li>
              <li>Pilih periode tahun dan semester yang sesuai dengan masa pelaporan.</li>
              <li>Jika Anda mengunggah ulang untuk periode yang sama, berkas laporan baru akan secara aman menggantikan berkas sebelumnya dan status akan kembali menjadi <em>Menunggu Pemeriksaan</em>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unduh Template Resmi (FR-REP-04) */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Template Laporan Resmi (.xlsx)</h3>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-200">
                Format Standar E-Report PBOBA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unduh template Excel resmi. Laporan mencakup 18 kolom terstandarisasi dengan formula perhitungan otomatis.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowColumnGuide(!showColumnGuide)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 border border-slate-200 rounded-none hover:bg-slate-50 transition-colors"
            >
              {showColumnGuide ? "Sembunyikan Format" : "Lihat Format Kolom"}
            </button>
            <TemplateDownloadButton label="Unduh Template (.xlsx)" variant="primary" />
          </div>
        </div>

        {/* Tabel Panduan Kolom Resmi */}
        {showColumnGuide && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in duration-200">
            <div className="overflow-x-auto rounded-none border border-slate-200 text-xs">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-emerald-800 text-white font-semibold">
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">NO</th>
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">NIE</th>
                    <th rowSpan={2} className="border border-emerald-700 px-4 py-2">NAMA PRODUK</th>
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">KEMASAN</th>
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">STOK AWAL</th>
                    <th colSpan={2} className="border border-emerald-700 px-3 py-1 bg-emerald-700">JUMLAH PEMASUKAN</th>
                    <th colSpan={9} className="border border-emerald-700 px-3 py-1 bg-emerald-700">JUMLAH PENGELUARAN</th>
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">Sisa Stok</th>
                    <th rowSpan={2} className="border border-emerald-700 px-3 py-2">HNA</th>
                  </tr>
                  <tr className="bg-emerald-900 text-emerald-100 text-2xs font-medium">
                    <th className="border border-emerald-700 px-2.5 py-1.5">IOT</th>
                    <th className="border border-emerald-700 px-2.5 py-1.5">Lainnya</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Pedagang eceran</th>
                    <th className="border border-emerald-700 px-2 py-1.5">RS</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Apotek</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Sarana Pemerintah</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Puskesmas</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Klinik</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Toko Obat</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Retur</th>
                    <th className="border border-emerald-700 px-2 py-1.5">Lainnya</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-50 text-slate-500 font-mono text-2xs">
                  <tr>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-400">1..n</td>
                    <td className="border border-slate-200 px-2 py-1.5">TR...</td>
                    <td className="border border-slate-200 px-3 py-1.5 text-left">Nama Produk</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-left">Kemasan</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">0</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right font-bold text-emerald-700 bg-emerald-50/50">Otomatis</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">Rp...</td>
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
        <div className="p-4 rounded-none bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between">
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-none bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Unggah Laporan (FR-REP-05, FR-REP-06) */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Formulir Unggah Laporan Semester
        </h2>

        {uploadError && (
          <div className="mb-4 p-3.5 rounded-none bg-red-50 border border-red-200 text-xs text-red-700">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pilihan Tahun */}
            <div>
              <label htmlFor="period_year" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tahun Pelaporan *
              </label>
              <select
                id="period_year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                className="w-full px-3 py-2 rounded-none border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value={1}>Semester 1 (Januari – Juni)</option>
                <option value={2}>Semester 2 (Juli – Desember)</option>
              </select>
            </div>
          </div>

          {/* Indikator apakah periode ini sudah ada */}
          {existingReportForPeriod && (
            <div className="p-3.5 rounded-none bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>Perhatian:</strong> Laporan untuk <strong>Tahun {selectedYear} Semester {selectedSemester}</strong> sudah pernah diunggah sebelumnya (<em>{existingReportForPeriod.original_filename}</em>).
                <span className="block mt-0.5 text-amber-700">
                  Mengunggah berkas baru sekarang akan menggantikan laporan sebelumnya dan mereset status pemeriksaan.
                </span>
              </div>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Berkas Laporan Excel (.xlsx) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-none hover:border-emerald-400 transition-colors bg-slate-50/50">
              <div className="space-y-2 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600 justify-center">
                  <label htmlFor="report-file-input" className="relative cursor-pointer bg-white rounded-none font-semibold text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-2 py-0.5 border border-slate-200">
                    <span>Pilih Berkas</span>
                    <input
                      id="report-file-input"
                      name="file"
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-2 pt-0.5">atau tarik dan lepas ke sini</p>
                </div>
                <p className="text-2xs text-slate-400">
                  Format resmi .xlsx hingga batas 10 MB
                </p>
                {selectedFile && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-none inline-block border border-emerald-200">
                    Berkas terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-none text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm gap-2"
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
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Riwayat Laporan Semester Entitas
          </h2>
          <span className="text-xs text-slate-500">
            Total {reports.length} laporan
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <svg className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Memuat riwayat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-none bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
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
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
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
