"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DownloadButton from "@/components/DownloadButton";
import { badge, btnPrimary, btnSecondary, btnSmall, btnSmallQuiet, input, panel } from "@/components/ui";

interface ReporterUser {
  id: string;
  name: string;
  identifier: string;
  email: string;
  is_active: boolean;
}

interface ReportItem {
  id: string;
  user_id: string;
  period_year: number;
  period_semester: number;
  original_filename: string;
  uploaded_at: string;
  status: "pending_review" | "reviewed" | "revision_required";
  reviewed_at: string | null;
  user: ReporterUser;
}

interface ReportsResponse {
  period: {
    year: number;
    semester: number;
  };
  summary: {
    total_reporters: number;
    submitted_count: number;
    reviewed_count: number;
    pending_review_count: number;
    unsubmitted_count: number;
  };
  reports: ReportItem[];
  unsubmitted_reporters: ReporterUser[];
}

interface SheetRow {
  no: number | string;
  nie: string;
  nama_produk: string;
  kemasan: string;
  stok_awal: number;
  masuk_iot: number;
  masuk_lainnya: number;
  keluar_pedagang_eceran: number;
  keluar_rs: number;
  keluar_apotek: number;
  keluar_sarana_pemerintah: number;
  keluar_puskesmas: number;
  keluar_klinik: number;
  keluar_toko_obat: number;
  keluar_retur: number;
  keluar_lainnya: number;
  sisa_stok: number;
  hna: number | string;
}

interface ReportPreviewData {
  report: {
    id: string;
    reporter_name: string;
    reporter_identifier: string;
    reporter_email: string;
    period_year: number;
    period_semester: number;
    uploaded_at: string;
    status: string;
    original_filename: string;
  };
  sheetData: {
    title: string;
    sheet_name: string;
    rows: SheetRow[];
    summary: {
      total_items: number;
      total_stok_awal: number;
      total_pemasukan: number;
      total_pengeluaran: number;
      total_sisa_stok: number;
    };
    signer: {
      penanggung_jawab: string;
      sipttk: string;
    };
  };
}

export default function ReportsAdminClient() {
  const currentYear = new Date().getFullYear();
  const currentSemester = new Date().getMonth() < 6 ? 1 : 2;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester);
  const [activeTab, setActiveTab] = useState<"submitted" | "unsubmitted">("submitted");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In-System Excel Spreadsheet Viewer State
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Review confirmation modal / action state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filter daftar laporan berdasarkan input pencarian nama entitas, ID/username, atau email
  const filteredReports = useMemo(() => {
    if (!data?.reports) return [];
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase().trim();
    return data.reports.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.identifier.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q)
    );
  }, [data?.reports, searchQuery]);

  // Filter daftar pelapor yang belum melapor
  const filteredUnsubmitted = useMemo(() => {
    if (!data?.unsubmitted_reporters) return [];
    if (!searchQuery.trim()) return data.unsubmitted_reporters;
    const q = searchQuery.toLowerCase().trim();
    return data.unsubmitted_reporters.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [data?.unsubmitted_reporters, searchQuery]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/reports?year=${selectedYear}&semester=${selectedSemester}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal memuat data laporan.");
      }
      const json: ReportsResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Buka isi laporan langsung di dalam sistem
  const handleOpenPreview = async (reportId: string) => {
    setPreviewReportId(reportId);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/preview`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal membuka isi berkas laporan.");
      setPreviewData(json);
    } catch (err: unknown) {
      setPreviewError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleMarkReviewed = async (reportId: string) => {
    setReviewLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/review`, {
        method: "PATCH",
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menandai laporan.");
      }

      setFeedbackMsg({
        text: "Laporan berhasil diverifikasi dan ditandai sebagai 'Sudah Diperiksa'.",
        type: "success",
      });
      setReviewingId(null);
      // Perbarui status pada preview jika sedang terbuka
      if (previewData && previewData.report.id === reportId) {
        setPreviewData({
          ...previewData,
          report: { ...previewData.report, status: "reviewed" },
        });
      }
      await fetchReports();
    } catch (err: unknown) {
      setFeedbackMsg({
        text: err instanceof Error ? err.message : "Gagal menandai laporan.",
        type: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const formatWib = (dateStr: string) => {
    return (
      new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }) + " WIB"
    );
  };

  const summaryItems = [
    { label: "Laporan masuk", value: data?.summary.submitted_count ?? 0 },
    { label: "Sudah diperiksa", value: data?.summary.reviewed_count ?? 0 },
    { label: "Menunggu pemeriksaan", value: data?.summary.pending_review_count ?? 0 },
    { label: "Belum menyerahkan", value: data?.summary.unsubmitted_count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Pemeriksaan laporan distribusi</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Klik nama entitas untuk membuka isi tabel Excel langsung di dalam sistem.
        </p>
      </header>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
            feedbackMsg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter & Pencarian Toolbar */}
      <div className={`${panel} flex flex-wrap items-center gap-4 p-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="filter-year" className="text-xs font-medium text-ink-soft">
            Periode
          </label>
          <select
            id="filter-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-9 rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink transition-colors duration-150 focus:border-purple-600"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>

          <select
            aria-label="Semester periode"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="h-9 rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink transition-colors duration-150 focus:border-purple-600"
          >
            <option value={1}>Semester I (Januari - Juni)</option>
            <option value={2}>Semester II (Juli - Desember)</option>
          </select>
        </div>

        {/* Kotak Pencarian Entitas PBOT */}
        <div className="relative min-w-[200px] flex-1">
          <input
            type="text"
            aria-label="Cari entitas pelapor"
            placeholder="Cari entitas, username, atau email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${input} pr-9`}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft transition-colors duration-150 hover:text-ink"
              title="Bersihkan pencarian"
              aria-label="Bersihkan pencarian"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
          )}
        </div>

        <p className="tabular text-xs text-ink-soft">
          Total pelapor:{" "}
          <span className="font-semibold text-ink">{data?.summary.total_reporters ?? 0} PBOT</span>
        </p>
      </div>

      {/* Kartu Ringkasan Kepatuhan */}
      <section className={`${panel} grid grid-cols-2 gap-px bg-line lg:grid-cols-4`}>
        {summaryItems.map((item) => (
          <div key={item.label} className="bg-surface px-5 py-4">
            <p className="text-xs font-medium text-ink-soft">{item.label}</p>
            <p className="tabular mt-1.5 text-2xl font-bold text-ink">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Tab Konten */}
      <div className={`${panel} overflow-hidden`}>
        <div className="flex gap-1 border-b border-line bg-canvas p-2">
          <button
            onClick={() => setActiveTab("submitted")}
            aria-pressed={activeTab === "submitted"}
            className={[
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-150",
              activeTab === "submitted"
                ? "bg-surface font-semibold text-ink shadow-panel"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            Berkas laporan masuk
            <span
              className={`tabular rounded-sm px-1.5 py-0.5 text-2xs font-semibold ${
                activeTab === "submitted" ? "bg-purple-100 text-purple-800" : "bg-line text-ink-soft"
              }`}
            >
              {searchQuery
                ? `${filteredReports.length}/${data?.reports.length ?? 0}`
                : (data?.reports.length ?? 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unsubmitted")}
            aria-pressed={activeTab === "unsubmitted"}
            className={[
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors duration-150",
              activeTab === "unsubmitted"
                ? "bg-surface font-semibold text-ink shadow-panel"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            Belum melapor
            <span
              className={`tabular rounded-sm px-1.5 py-0.5 text-2xs font-semibold ${
                activeTab === "unsubmitted" ? "bg-rose-100 text-rose-800" : "bg-line text-ink-soft"
              }`}
            >
              {searchQuery
                ? `${filteredUnsubmitted.length}/${data?.unsubmitted_reporters.length ?? 0}`
                : (data?.unsubmitted_reporters.length ?? 0)}
            </span>
          </button>
        </div>

        {/* Tabel Konten */}
        <div className="p-4">
          {loading ? (
            <div className="py-16 text-center">
              <svg className="mx-auto h-6 w-6 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="mt-3 text-sm text-ink-soft">Memuat data laporan...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center" role="alert">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
              <p className="mt-1 text-xs text-ink-soft">
                Data periode ini tidak dapat dimuat. Ganti periode atau muat ulang halaman.
              </p>
            </div>
          ) : activeTab === "submitted" ? (
            /* TAB 1: LAPORAN MASUK */
            filteredReports.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-soft">
                {searchQuery ? (
                  <div>
                    <p className="font-semibold text-ink">
                      Tidak ada entitas yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs font-semibold text-purple-700 underline underline-offset-2 hover:text-purple-900"
                    >
                      Bersihkan pencarian
                    </button>
                  </div>
                ) : (
                  <p>
                    Belum ada berkas laporan untuk Tahun {selectedYear} Semester {selectedSemester}.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[46rem] text-left">
                  <thead className="border-b border-line bg-canvas">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        Entitas PBOT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        ID pelapor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        Waktu unggah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                        Aksi pemeriksaan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredReports.map((rep) => (
                      <tr key={rep.id} className="transition-colors duration-150 hover:bg-purple-50/40">
                        {/* Klik Nama Entitas langsung membuka isi spreadsheet di sistem */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(rep.id)}
                            className="text-left"
                            title="Buka isi laporan di dalam sistem"
                          >
                            <span className="text-sm font-semibold text-purple-700 underline-offset-2 hover:underline hover:text-purple-900">
                              {rep.user.name}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-soft">{rep.user.email}</span>
                          </button>
                        </td>

                        <td className="px-4 py-3 font-mono text-xs text-ink">{rep.user.identifier}</td>

                        <td className="px-4 py-3 text-xs text-ink-soft">{formatWib(rep.uploaded_at)}</td>

                        <td className="px-4 py-3">
                          {rep.status === "reviewed" ? (
                            <span className={`${badge} border-emerald-200 bg-emerald-50 text-emerald-800`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                              Sudah diperiksa
                            </span>
                          ) : (
                            <span className={`${badge} border-amber-200 bg-amber-50 text-amber-800`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                              Menunggu pemeriksaan
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(rep.id)}
                              className={btnSmallQuiet}
                            >
                              Buka
                            </button>
                            {rep.status !== "reviewed" && (
                              <button
                                type="button"
                                onClick={() => setReviewingId(rep.id)}
                                className={btnSmall}
                              >
                                Tandai selesai
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* TAB 2: BELUM MELAPOR */
            filteredUnsubmitted.length === 0 ? (
              <div className="py-12 text-center text-sm">
                {searchQuery ? (
                  <div>
                    <p className="font-semibold text-ink">
                      Tidak ada entitas yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs font-semibold text-purple-700 underline underline-offset-2 hover:text-purple-900"
                    >
                      Bersihkan pencarian
                    </button>
                  </div>
                ) : (
                  <p className="font-semibold text-emerald-700">
                    Seluruh entitas PBOT telah menyerahkan laporan untuk periode ini.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[40rem] text-left">
                  <thead className="border-b border-line bg-canvas">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        Nama badan usaha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        ID akun
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                        Email korespondensi
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                        Status kepatuhan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUnsubmitted.map((usr) => (
                      <tr key={usr.id} className="transition-colors duration-150 hover:bg-purple-50/40">
                        <td className="px-4 py-3 text-sm font-medium text-ink">{usr.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-soft">{usr.identifier}</td>
                        <td className="px-4 py-3 text-xs text-ink-soft">{usr.email}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`${badge} border-rose-200 bg-rose-50 text-rose-800`}>
                            Belum ada berkas
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL IN-SYSTEM SPREADSHEET VIEWER (BUKA ISI EXCEL LANGSUNG DI SISTEM)   */}
      {/* ========================================================================= */}
      {previewReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60 p-2 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-modal"
          >
            {/* Header Modal */}
            <div className="flex shrink-0 items-center justify-between gap-4 bg-purple-950 px-6 py-4 text-white">
              <div className="min-w-0">
                <h2 id="preview-title" className="truncate text-sm font-bold">
                  {previewData?.report.reporter_name || "Pemeriksaan berkas laporan"}
                </h2>
                <p className="mt-0.5 truncate font-mono text-2xs text-purple-200">
                  Tahun {previewData?.report.period_year} semester{" "}
                  {previewData?.report.period_semester} · akun @{previewData?.report.reporter_identifier} ·{" "}
                  {previewData?.report.original_filename}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {previewData && (
                  <DownloadButton
                    reportId={previewData.report.id}
                    filename={previewData.report.original_filename}
                    label="Unduh salinan"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setPreviewReportId(null)}
                  className="inline-flex h-9 items-center rounded-md border border-white/25 px-3 text-xs font-semibold text-white transition-colors duration-150 hover:bg-white/10"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Isi Konten Sheet */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-canvas p-5">
              {previewLoading ? (
                <div className="py-20 text-center">
                  <svg className="mx-auto h-8 w-8 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="mt-3 text-sm text-ink-soft">
                    Membaca dan memproses tabel spreadsheet laporan...
                  </p>
                </div>
              ) : previewError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                  {previewError}
                </div>
              ) : previewData ? (
                <>
                  {/* Kartu Ringkasan Data Angka */}
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-5">
                    <div className="bg-surface px-4 py-3">
                      <p className="text-2xs font-medium text-ink-soft">Total baris</p>
                      <p className="tabular mt-1 text-lg font-bold text-ink">
                        {previewData.sheetData.summary.total_items}
                      </p>
                    </div>
                    <div className="bg-surface px-4 py-3">
                      <p className="text-2xs font-medium text-ink-soft">Stok awal</p>
                      <p className="tabular mt-1 text-lg font-bold text-ink">
                        {previewData.sheetData.summary.total_stok_awal.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-surface px-4 py-3">
                      <p className="text-2xs font-medium text-ink-soft">Pemasukan</p>
                      <p className="tabular mt-1 text-lg font-bold text-emerald-700">
                        {previewData.sheetData.summary.total_pemasukan.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-surface px-4 py-3">
                      <p className="text-2xs font-medium text-ink-soft">Pengeluaran</p>
                      <p className="tabular mt-1 text-lg font-bold text-ink">
                        {previewData.sheetData.summary.total_pengeluaran.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-surface px-4 py-3">
                      <p className="text-2xs font-medium text-ink-soft">Sisa stok akhir</p>
                      <p className="tabular mt-1 text-lg font-bold text-purple-700">
                        {previewData.sheetData.summary.total_sisa_stok.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Judul Sheet Resmi */}
                  <div className="rounded-md border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink">
                    {previewData.sheetData.title}
                  </div>

                  {/* TABEL SPREADSHEET 18 KOLOM RESMI */}
                  <div className="overflow-x-auto rounded-md border border-line bg-surface">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="bg-purple-950 text-white">
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2">NO</th>
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2">NIE</th>
                          <th rowSpan={2} className="border border-purple-900 px-3 py-2 text-left">NAMA PRODUK</th>
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2 text-left">KEMASAN</th>
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2">STOK AWAL</th>
                          <th colSpan={2} className="border border-purple-900 px-2 py-1">JUMLAH PEMASUKAN</th>
                          <th colSpan={9} className="border border-purple-900 px-2 py-1">JUMLAH PENGELUARAN</th>
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2">Sisa Stok</th>
                          <th rowSpan={2} className="border border-purple-900 px-2.5 py-2">HNA</th>
                        </tr>
                        <tr className="bg-purple-900 text-purple-100">
                          {/* Pemasukan */}
                          <th className="border border-purple-800 px-2 py-1 font-medium">IOT</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Lainnya</th>
                          {/* Pengeluaran */}
                          <th className="border border-purple-800 px-2 py-1 font-medium">Pedagang eceran</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">RS</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Apotek</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Sarana Pemerintah</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Puskesmas</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Klinik</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Toko Obat</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Retur</th>
                          <th className="border border-purple-800 px-2 py-1 font-medium">Lainnya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line font-mono text-2xs">
                        {previewData.sheetData.rows.length === 0 ? (
                          <tr>
                            <td colSpan={18} className="px-3 py-6 text-center text-ink-soft">
                              Tidak ada data baris yang terisi.
                            </td>
                          </tr>
                        ) : (
                          previewData.sheetData.rows.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-surface" : "bg-canvas"}>
                              <td className="border border-line px-2 py-1.5 text-center font-sans text-ink-soft">{r.no}</td>
                              <td className="border border-line px-2 py-1.5 text-center">{r.nie}</td>
                              <td className="border border-line px-3 py-1.5 text-left font-sans font-semibold text-ink">{r.nama_produk}</td>
                              <td className="border border-line px-2 py-1.5 text-left font-sans">{r.kemasan}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.stok_awal.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.masuk_iot.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.masuk_lainnya.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_pedagang_eceran.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_rs.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_apotek.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_sarana_pemerintah.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_puskesmas.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_klinik.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_toko_obat.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_retur.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.keluar_lainnya.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line bg-purple-50/60 px-2 py-1.5 text-right font-semibold text-purple-800">{r.sisa_stok.toLocaleString("id-ID")}</td>
                              <td className="tabular border border-line px-2 py-1.5 text-right">{r.hna}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Penanggung Jawab Footer */}
                  <div className="rounded-md border border-line bg-surface px-4 py-3 text-xs">
                    <p className="font-semibold text-ink">Penanggung jawab PBOT</p>
                    <p className="mt-1 text-ink-soft">{previewData.sheetData.signer.penanggung_jawab}</p>
                    <p className="mt-0.5 font-mono text-2xs text-ink-soft">
                      SIPTTK / STRA: {previewData.sheetData.signer.sipttk}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-line bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-soft">
                Status saat ini:{" "}
                <span className="font-semibold text-ink">
                  {previewData?.report.status === "reviewed"
                    ? "Sudah diperiksa (reviewed)"
                    : "Menunggu pemeriksaan (pending review)"}
                </span>
              </p>

              <div className="flex items-center gap-2">
                {previewData && previewData.report.status !== "reviewed" && (
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(previewData.report.id)}
                    disabled={reviewLoading}
                    className={btnPrimary}
                  >
                    {reviewLoading ? "Memproses" : "Tandai sudah diperiksa"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewReportId(null)}
                  className={btnSecondary}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Biasa */}
      {reviewingId && !previewReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-confirm-title"
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="px-6 py-5">
              <h3 id="review-confirm-title" className="text-base font-bold text-ink">
                Konfirmasi pemeriksaan laporan
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Apakah berkas ini sudah Anda periksa dari sisi kelengkapan dan kebenaran data?
                Status laporan akan diubah menjadi{" "}
                <span className="font-semibold text-ink">Sudah diperiksa (reviewed)</span>.
              </p>
            </div>
            <div className="flex flex-col-reverse justify-end gap-2 border-t border-line px-6 py-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setReviewingId(null)}
                className={btnSecondary}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleMarkReviewed(reviewingId)}
                className={btnPrimary}
              >
                {reviewLoading ? "Memproses" : "Ya, tandai selesai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
