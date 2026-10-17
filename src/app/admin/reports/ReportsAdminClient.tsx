"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DownloadButton from "@/components/DownloadButton";

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

  return (
    <div className="space-y-6">
      {/* Header Halaman (Square / Tegas) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pemeriksaan Laporan Distribusi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Klik nama entitas untuk membuka dan memverifikasi isi tabel Excel langsung di dalam sistem.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-3.5 text-xs font-semibold rounded-xl border ${
            feedbackMsg.type === "success"
              ? "bg-purple-50 border-purple-200 text-purple-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          } flex items-center justify-between shadow-xs`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold uppercase underline hover:no-underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter & Pencarian Toolbar (Modern Floating Style) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Periode:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          >
            <option value={1}>Semester I (Januari – Juni)</option>
            <option value={2}>Semester II (Juli – Desember)</option>
          </select>
        </div>

        {/* Kotak Pencarian Entitas PBOT */}
        <div className="flex-1 max-w-xs min-w-[220px] relative">
          <input
            type="text"
            placeholder="Cari entitas, username, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              title="Bersihkan Pencarian"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          )}
        </div>

        <div className="text-xs font-medium text-slate-500 bg-purple-50/60 px-3 py-1.5 rounded-xl border border-purple-100">
          Total Pelapor:{" "}
          <strong className="text-purple-900 font-bold">{data?.summary.total_reporters ?? 0} PBOT</strong>
        </div>
      </div>

      {/* Kartu Ringkasan Kepatuhan (4 Kartu Modern Purple / Indigo / Violet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sudah Lapor */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md shadow-purple-900/10">
          <div className="text-3xl font-black tracking-tight">{data?.summary.submitted_count ?? 0}</div>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-100">
            Laporan Masuk
          </p>
        </div>

        {/* Sudah Diperiksa */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-5 rounded-2xl shadow-md shadow-indigo-900/10">
          <div className="text-3xl font-black tracking-tight">{data?.summary.reviewed_count ?? 0}</div>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-indigo-100">
            Sudah Diperiksa
          </p>
        </div>

        {/* Menunggu Review */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-5 rounded-2xl shadow-md shadow-violet-900/10">
          <div className="text-3xl font-black tracking-tight">{data?.summary.pending_review_count ?? 0}</div>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-violet-100">
            Menunggu Pemeriksaan
          </p>
        </div>

        {/* Belum Lapor */}
        <div className="bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md shadow-purple-900/10">
          <div className="text-3xl font-black tracking-tight">{data?.summary.unsubmitted_count ?? 0}</div>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-purple-200">
            Belum Menyerahkan
          </p>
        </div>
      </div>

      {/* Tab Konten Modern */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200/80 bg-slate-50/70 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center gap-2 ${
              activeTab === "submitted"
                ? "bg-white text-purple-700 shadow-sm shadow-purple-500/10 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Berkas Laporan Masuk</span>
            <span className={`px-2 py-0.5 text-2xs font-bold rounded-full ${activeTab === "submitted" ? "bg-purple-100 text-purple-800" : "bg-slate-200 text-slate-700"}`}>
              {searchQuery ? `${filteredReports.length}/${data?.reports.length ?? 0}` : (data?.reports.length ?? 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unsubmitted")}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center gap-2 ${
              activeTab === "unsubmitted"
                ? "bg-white text-rose-700 shadow-sm shadow-rose-500/10 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Belum Melapor</span>
            <span className={`px-2 py-0.5 text-2xs font-bold rounded-full ${activeTab === "unsubmitted" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"}`}>
              {searchQuery ? `${filteredUnsubmitted.length}/${data?.unsubmitted_reporters.length ?? 0}` : (data?.unsubmitted_reporters.length ?? 0)}
            </span>
          </button>
        </div>

        {/* Tabel Konten */}
        <div className="p-4">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent mx-auto mb-2 rounded-full"></div>
              Memuat data laporan...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600 text-xs font-semibold">{error}</div>
          ) : activeTab === "submitted" ? (
            /* TAB 1: LAPORAN MASUK */
            filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {searchQuery ? (
                  <div>
                    <p className="font-semibold text-slate-700">
                      Tidak ada entitas yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-800 underline font-bold"
                    >
                      Bersihkan Pencarian
                    </button>
                  </div>
                ) : (
                  "Belum ada berkas laporan yang diunggah untuk Tahun " + selectedYear + " Semester " + selectedSemester + "."
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white uppercase text-2xs font-bold">
                      <th className="py-3 px-4">Entitas PBOT (Klik untuk Buka)</th>
                      <th className="py-3 px-4">ID Pelapor</th>
                      <th className="py-3 px-4">Waktu Unggah</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi Pemeriksaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-purple-50/50 transition-colors">
                        {/* Klik Nama Entitas langsung membuka isi spreadsheet di sistem */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(rep.id)}
                            className="text-left group cursor-pointer"
                            title="Klik untuk membuka isi laporan di dalam sistem"
                          >
                            <p className="font-bold text-purple-700 group-hover:text-purple-900 group-hover:underline text-xs flex items-center gap-1.5">
                              <span>📄</span>
                              <span>{rep.user.name}</span>
                              <span className="text-3xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                Buka
                              </span>
                            </p>
                            <p className="text-2xs text-slate-500 mt-0.5">{rep.user.email}</p>
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {rep.user.identifier}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {formatWib(rep.uploaded_at)}
                        </td>

                        <td className="py-3 px-4">
                          {rep.status === "reviewed" ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-2xs rounded-full border border-emerald-200">
                              Sudah Diperiksa ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold text-2xs rounded-full border border-amber-200">
                              Menunggu Pemeriksaan
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(rep.id)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 text-2xs font-bold uppercase rounded-lg transition-all shadow-xs"
                          >
                            Buka Laporan
                          </button>

                          {rep.status !== "reviewed" ? (
                            <button
                              type="button"
                              onClick={() => setReviewingId(rep.id)}
                              className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-1.5 text-2xs font-bold uppercase rounded-lg transition-all shadow-xs"
                            >
                              Tandai Selesai
                            </button>
                          ) : null}
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
              <div className="py-12 text-center text-xs">
                {searchQuery ? (
                  <div>
                    <p className="font-semibold text-slate-700">
                      Tidak ada entitas yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-rose-600 underline font-bold"
                    >
                      Bersihkan Pencarian
                    </button>
                  </div>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    Seluruh entitas PBOT telah menyerahkan laporan untuk periode ini.
                  </span>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-rose-700 to-purple-900 text-white uppercase text-2xs font-bold">
                      <th className="py-3 px-4">Nama Entitas PBOT</th>
                      <th className="py-3 px-4">ID Akun</th>
                      <th className="py-3 px-4">Email Korespondensi</th>
                      <th className="py-3 px-4 text-right">Status Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnsubmitted.map((usr) => (
                      <tr key={usr.id} className="hover:bg-rose-50/40">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {usr.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {usr.identifier}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {usr.email}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 font-bold text-2xs rounded-full border border-rose-200">
                            Belum Ada Berkas
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/30 text-white font-black text-xs flex items-center justify-center rounded-xl shadow-xs border border-white/20">
                  XLS
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider truncate max-w-xl">
                    {previewData?.report.reporter_name || "Pemeriksaan Berkas Laporan"}
                  </h2>
                  <p className="text-2xs text-purple-200 font-mono mt-0.5">
                    Periode: Tahun {previewData?.report.period_year} Semester {previewData?.report.period_semester} | Akun: @{previewData?.report.reporter_identifier}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewData && (
                  <DownloadButton
                    reportId={previewData.report.id}
                    filename={previewData.report.original_filename}
                    label="Unduh Salinan (.xlsx)"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setPreviewReportId(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-colors"
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Isi Konten Sheet */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9fc]">
              {previewLoading ? (
                <div className="py-20 text-center text-slate-600 text-xs">
                  <div className="animate-spin w-8 h-8 border-3 border-purple-600 border-t-transparent mx-auto mb-3 rounded-full"></div>
                  Membaca dan memproses tabel spreadsheet laporan...
                </div>
              ) : previewError ? (
                <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {previewError}
                </div>
              ) : previewData ? (
                <>
                  {/* Kartu Ringkasan Data Angka */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                      <span className="text-3xs uppercase font-bold text-slate-400">Total Baris</span>
                      <p className="text-base font-extrabold text-slate-800">{previewData.sheetData.summary.total_items}</p>
                    </div>
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                      <span className="text-3xs uppercase font-bold text-slate-400">Total Stok Awal</span>
                      <p className="text-base font-extrabold text-slate-800">{previewData.sheetData.summary.total_stok_awal.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                      <span className="text-3xs uppercase font-bold text-emerald-600">Total Pemasukan</span>
                      <p className="text-base font-extrabold text-emerald-700">{previewData.sheetData.summary.total_pemasukan.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                      <span className="text-3xs uppercase font-bold text-indigo-600">Total Pengeluaran</span>
                      <p className="text-base font-extrabold text-indigo-700">{previewData.sheetData.summary.total_pengeluaran.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                      <span className="text-3xs uppercase font-bold text-purple-600">Sisa Stok Akhir</span>
                      <p className="text-base font-extrabold text-purple-700">{previewData.sheetData.summary.total_sisa_stok.toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  {/* Judul Sheet Resmi */}
                  <div className="bg-white px-4 py-2.5 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 shadow-xs">
                    {previewData.sheetData.title}
                  </div>

                  {/* TABEL SPREADSHEET 18 KOLOM RESMI */}
                  <div className="bg-white border border-slate-200/80 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-purple-900 text-white font-bold">
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2">NO</th>
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2">NIE</th>
                          <th rowSpan={2} className="border border-purple-800 px-3 py-2 text-left">NAMA PRODUK</th>
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2 text-left">KEMASAN</th>
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2">STOK AWAL</th>
                          <th colSpan={2} className="border border-purple-800 px-2 py-1 bg-purple-800">JUMLAH PEMASUKAN</th>
                          <th colSpan={9} className="border border-purple-800 px-2 py-1 bg-purple-800">JUMLAH PENGELUARAN</th>
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2">Sisa Stok</th>
                          <th rowSpan={2} className="border border-purple-800 px-2.5 py-2">HNA</th>
                        </tr>
                        <tr className="bg-purple-950 text-purple-200 text-2xs font-semibold">
                          {/* Pemasukan */}
                          <th className="border border-purple-800 px-2 py-1">IOT</th>
                          <th className="border border-purple-800 px-2 py-1">Lainnya</th>
                          {/* Pengeluaran */}
                          <th className="border border-purple-800 px-2 py-1">Pedagang eceran</th>
                          <th className="border border-purple-800 px-2 py-1">RS</th>
                          <th className="border border-purple-800 px-2 py-1">Apotek</th>
                          <th className="border border-purple-800 px-2 py-1">Sarana Pemerintah</th>
                          <th className="border border-purple-800 px-2 py-1">Puskesmas</th>
                          <th className="border border-purple-800 px-2 py-1">Klinik</th>
                          <th className="border border-purple-800 px-2 py-1">Toko Obat</th>
                          <th className="border border-purple-800 px-2 py-1">Retur</th>
                          <th className="border border-purple-800 px-2 py-1">Lainnya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                        {previewData.sheetData.rows.length === 0 ? (
                          <tr>
                            <td colSpan={18} className="py-6 text-center text-slate-400">
                              Tidak ada data baris yang terisi.
                            </td>
                          </tr>
                        ) : (
                          previewData.sheetData.rows.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-center text-slate-500 font-sans">{r.no}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-center">{r.nie}</td>
                              <td className="border border-slate-200/80 px-3 py-1.5 text-left font-sans font-semibold text-slate-800">{r.nama_produk}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-left font-sans">{r.kemasan}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.stok_awal.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.masuk_iot.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.masuk_lainnya.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_pedagang_eceran.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_rs.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_apotek.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_sarana_pemerintah.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_puskesmas.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_klinik.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_toko_obat.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_retur.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.keluar_lainnya.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right font-bold text-purple-700 bg-purple-50/50">{r.sisa_stok.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200/80 px-2 py-1.5 text-right">{r.hna}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Penanggung Jawab Footer */}
                  <div className="bg-white p-4 border border-slate-200/80 rounded-xl text-xs shadow-xs">
                    <p className="font-bold text-slate-800">Penanggung Jawab PBOT:</p>
                    <p className="text-slate-700 mt-1">Nama : {previewData.sheetData.signer.penanggung_jawab}</p>
                    <p className="text-slate-500 font-mono text-2xs mt-0.5">SIPTTK / STRA : {previewData.sheetData.signer.sipttk}</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-white border-t border-slate-200/80 p-4 px-6 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Status saat ini:{" "}
                <span className="font-bold text-slate-800">
                  {previewData?.report.status === "reviewed"
                    ? "Sudah Diperiksa (Reviewed)"
                    : "Menunggu Pemeriksaan (Pending Review)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {previewData && previewData.report.status !== "reviewed" && (
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(previewData.report.id)}
                    disabled={reviewLoading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-purple-500/25 disabled:opacity-50"
                  >
                    {reviewLoading ? "Memproses..." : "✓ Tandai Telah Diperiksa"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewReportId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-bold uppercase rounded-xl transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Konfirmasi Pemeriksaan Laporan
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Apakah Anda yakin telah memeriksa kelengkapan dan kebenaran berkas laporan ini?
              Status laporan akan diubah menjadi <strong>Sudah Diperiksa (reviewed)</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingId(null)}
                className="px-4 py-2.5 text-xs font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleMarkReviewed(reviewingId)}
                className="px-5 py-2.5 text-xs font-bold uppercase bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                {reviewLoading ? "Memproses..." : "Ya, Tandai Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
