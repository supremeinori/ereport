"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DownloadButton from "@/components/DownloadButton";
import TemplateDownloadButton from "@/components/TemplateDownloadButton";
import { badge, btnPrimary, btnSecondary, label, pageSubtitle, pageTitle, panel, th, td } from "@/components/ui";

interface ReportItem {
  id: string;
  period_year: number;
  period_semester: number;
  original_filename: string;
  uploaded_at: string;
  status: "pending_review" | "reviewed" | "revision_required";
  reviewed_at?: string | null;
}

const STATUS_BADGE: Record<ReportItem["status"], string> = {
  reviewed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  revision_required: "border-rose-200 bg-rose-50 text-rose-800",
  pending_review: "border-amber-200 bg-amber-50 text-amber-800",
};

const STATUS_LABEL: Record<ReportItem["status"], string> = {
  reviewed: "Telah diperiksa",
  revision_required: "Perlu revisi",
  pending_review: "Menunggu pemeriksaan",
};

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

  const getStatusBadge = (status: ReportItem["status"]) => (
    <span className={`${badge} ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
  );

  return (
    <div className="space-y-8">
      {/* Judul & Deskripsi */}
      <div>
        <h1 className={pageTitle}>Pelaporan Distribusi Obat Tradisional</h1>
        <p className={pageSubtitle}>
          Kirimkan berkas laporan semesteran resmi dalam format Excel (.xlsx) sesuai standar BPOM.
        </p>
      </div>

      {/* Instruksi Pelaporan */}
      <div className={`${panel} p-5 sm:p-6`}>
        <h3 className="text-base font-bold text-ink">Petunjuk Pengisian dan Ketentuan Pengunggahan</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>Pastikan laporan menggunakan template resmi Excel yang telah diisi lengkap.</li>
          <li>
            Sistem hanya menerima berkas berformat <strong className="text-ink">.xlsx</strong> dengan ukuran
            maksimum <strong className="text-ink">10 MB</strong>. Berkas dengan makro (.xlsm) akan ditolak.
          </li>
          <li>Pilih periode tahun dan semester yang sesuai dengan masa pelaporan.</li>
          <li>
            Jika Anda mengunggah ulang untuk periode yang sama, berkas laporan baru akan secara aman
            menggantikan berkas sebelumnya dan status akan kembali menjadi{" "}
            <em className="text-ink">Menunggu Pemeriksaan</em>.
          </li>
        </ul>
      </div>

      {/* Unduh Template Resmi */}
      <div className={panel}>
        <div className="space-y-4 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Template Laporan Resmi (.xlsx)</h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Unduh template Excel resmi. Laporan mencakup 18 kolom terstandarisasi dengan formula perhitungan otomatis.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowColumnGuide(!showColumnGuide)}
                className={btnSecondary}
              >
                {showColumnGuide ? "Sembunyikan Format" : "Lihat Format Kolom"}
              </button>
              <TemplateDownloadButton label="Unduh Template (.xlsx)" variant="primary" />
            </div>
          </div>

          {/* Tabel Panduan Kolom Resmi */}
          {showColumnGuide && (
            <div className="border-t border-line pt-4">
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
                      <th className="border border-purple-800 px-2.5 py-1.5">IOT</th>
                      <th className="border border-purple-800 px-2.5 py-1.5">Lainnya</th>
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
                      <td className="border border-line px-2 py-2 text-ink-soft/60">1..n</td>
                      <td className="border border-line px-2 py-2">TR...</td>
                      <td className="border border-line px-3 py-2 text-left font-sans">Nama Produk</td>
                      <td className="border border-line px-2 py-2 text-left font-sans">Kemasan</td>
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
                      <td className="border border-line px-2 py-2 text-right font-bold text-purple-700 bg-purple-50">Otomatis</td>
                      <td className="border border-line px-2 py-2 text-right font-sans">Rp...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-2xs text-ink-soft">
                Kolom <strong className="text-ink">Sisa Stok</strong> dihitung otomatis oleh Excel dari:{" "}
                <code className="font-mono">Stok Awal + Pemasukan - Pengeluaran</code>. Bagian bawah tabel wajib
                ditandatangani oleh <strong className="text-ink">Penanggung Jawab PBOT</strong> beserta nomor
                registrasi tenaga kefarmasian (SIPTTK / STRA).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Notifikasi Global */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-4 rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-4 rounded-md px-2 py-1 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Unggah Laporan */}
      <div className={panel}>
        <div className="p-6 sm:p-7">
          <div className="border-b border-line pb-4">
            <h2 className="text-base font-bold text-ink">Formulir Unggah Laporan Semester</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Pilih periode pelaporan dan unggah berkas excel yang valid
            </p>
          </div>

          {uploadError && (
            <div className="mt-5 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Pilihan Tahun */}
              <div>
                <label htmlFor="period_year" className={label}>
                  Tahun pelaporan <span className="text-rose-600">*</span>
                </label>
                <select
                  id="period_year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink transition-colors duration-150 focus:border-purple-600"
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
                <label htmlFor="period_semester" className={label}>
                  Semester pelaporan <span className="text-rose-600">*</span>
                </label>
                <select
                  id="period_semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                  className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink transition-colors duration-150 focus:border-purple-600"
                >
                  <option value={1}>Semester 1 (Januari - Juni)</option>
                  <option value={2}>Semester 2 (Juli - Desember)</option>
                </select>
              </div>
            </div>

            {/* Indikator apakah periode ini sudah ada */}
            {existingReportForPeriod && (
              <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-950">
                    Laporan untuk Tahun {selectedYear} Semester {selectedSemester} sudah pernah diunggah ({existingReportForPeriod.original_filename}).
                  </p>
                  <p className="mt-1 text-amber-800">
                    Mengunggah berkas baru sekarang akan menggantikan laporan sebelumnya dan mereset status pemeriksaan kembali menjadi{" "}
                    <em>Menunggu Pemeriksaan</em>.
                  </p>
                </div>
              </div>
            )}

            {/* File Picker */}
            <div>
              <label htmlFor="report-file-input" className={label}>
                Berkas laporan Excel (.xlsx) <span className="text-rose-600">*</span>
              </label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-line-strong bg-canvas p-6 transition-colors hover:border-purple-600">
                <div className="space-y-3 text-center">
                  <svg className="h-10 w-10 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                    <label htmlFor="report-file-input" className={btnPrimary}>
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
                    <span className="text-xs text-ink-soft">atau letakkan berkas di sini</span>
                  </div>
                  <p className="text-2xs text-ink-soft">
                    Format resmi .xlsx standar e-report, maksimum 10 MB
                  </p>
                  {selectedFile && (
                    <span className="inline-flex items-center gap-1.5 rounded-sm border border-purple-200 bg-purple-50 px-2.5 py-1 font-mono text-xs text-purple-900">
                      <svg className="h-3.5 w-3.5 text-purple-700" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isUploading || !selectedFile} className={btnPrimary}>
                {isUploading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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
      </div>

      {/* Riwayat Laporan */}
      <div className={panel}>
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-4">
          <h2 className="text-base font-bold text-ink">Riwayat Laporan Semester Entitas</h2>
          <span className="tabular text-xs text-ink-soft">{reports.length} laporan</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-ink-soft">
            <svg className="h-6 w-6 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Memuat riwayat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-sm font-semibold text-ink">Belum ada laporan semester yang diunggah</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Gunakan formulir di atas untuk mengunggah laporan semesteran pertama entitas Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Periode pelaporan</th>
                  <th className={th}>Nama berkas asli</th>
                  <th className={th}>Waktu unggah (WIB)</th>
                  <th className={th}>Status pemeriksaan</th>
                  <th className={th}>Waktu diperiksa</th>
                  <th className={`${th} text-right`}>Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reports.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-purple-50/50">
                    <td className={`${td} font-semibold`}>
                      Tahun {item.period_year}, Semester {item.period_semester}
                    </td>
                    <td className={`${td} font-mono text-xs text-ink-soft`}>{item.original_filename}</td>
                    <td className={`${td} text-xs text-ink-soft`}>
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
                    <td className={td}>{getStatusBadge(item.status)}</td>
                    <td className={`${td} text-xs text-ink-soft`}>
                      {item.reviewed_at
                        ? new Date(item.reviewed_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Belum diperiksa"}
                    </td>
                    <td className={`${td} text-right`}>
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