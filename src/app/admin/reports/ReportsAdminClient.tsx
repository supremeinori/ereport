"use client";

import { useState, useEffect, useCallback } from "react";
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

      {/* Feedback Alert (Square / rounded-none) */}
      {feedbackMsg && (
        <div
          className={`p-3 text-xs font-semibold rounded-none border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-red-50 border-red-300 text-red-800"
          } flex items-center justify-between`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold uppercase underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Toolbar (AdminLTE Square Style) */}
      <div className="bg-white border border-slate-300 rounded-none shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Periode:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#2d7d9a]"
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
            className="bg-white border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#2d7d9a]"
          >
            <option value={1}>Semester I (Januari – Juni)</option>
            <option value={2}>Semester II (Juli – Desember)</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Total Pelapor Terdaftar:{" "}
          <strong className="text-slate-900">{data?.summary.total_reporters ?? 0} PBOT</strong>
        </div>
      </div>

      {/* Kartu Ringkasan Kepatuhan (4 Kotak Tegas Persegi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sudah Lapor */}
        <div className="bg-[#00c0ef] text-white p-4 rounded-none shadow-xs">
          <div className="text-3xl font-extrabold">{data?.summary.submitted_count ?? 0}</div>
          <p className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
            Laporan Masuk
          </p>
        </div>

        {/* Sudah Diperiksa */}
        <div className="bg-[#00a65a] text-white p-4 rounded-none shadow-xs">
          <div className="text-3xl font-extrabold">{data?.summary.reviewed_count ?? 0}</div>
          <p className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
            Sudah Diperiksa
          </p>
        </div>

        {/* Menunggu Review */}
        <div className="bg-[#0073b7] text-white p-4 rounded-none shadow-xs">
          <div className="text-3xl font-extrabold">{data?.summary.pending_review_count ?? 0}</div>
          <p className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
            Menunggu Pemeriksaan
          </p>
        </div>

        {/* Belum Lapor */}
        <div className="bg-[#dd4b39] text-white p-4 rounded-none shadow-xs">
          <div className="text-3xl font-extrabold">{data?.summary.unsubmitted_count ?? 0}</div>
          <p className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
            Belum Menyerahkan
          </p>
        </div>
      </div>

      {/* Tab Konten (Persegi Tegas) */}
      <div className="bg-white border border-slate-300 rounded-none shadow-xs">
        <div className="flex border-b border-slate-200 bg-[#fafafa]">
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 rounded-none flex items-center gap-2 ${
              activeTab === "submitted"
                ? "border-[#2d7d9a] text-[#2d7d9a] bg-white font-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Berkas Laporan Masuk</span>
            <span className="px-1.5 py-0.2 text-2xs bg-slate-200 text-slate-800 font-bold rounded-none">
              {data?.reports.length ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unsubmitted")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 rounded-none flex items-center gap-2 ${
              activeTab === "unsubmitted"
                ? "border-[#dd4b39] text-[#dd4b39] bg-white font-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Belum Melapor</span>
            <span className="px-1.5 py-0.2 text-2xs bg-slate-200 text-slate-800 font-bold rounded-none">
              {data?.unsubmitted_reporters.length ?? 0}
            </span>
          </button>
        </div>

        {/* Tabel Konten */}
        <div className="p-4">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Memuat data laporan...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-xs">{error}</div>
          ) : activeTab === "submitted" ? (
            /* TAB 1: LAPORAN MASUK */
            data?.reports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Belum ada berkas laporan yang diunggah untuk Tahun {selectedYear} Semester {selectedSemester}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#2d7d9a] text-white uppercase text-2xs font-bold">
                      <th className="py-2.5 px-3 border border-[#236881]">Entitas PBOT (Klik untuk Buka)</th>
                      <th className="py-2.5 px-3 border border-[#236881]">ID Pelapor</th>
                      <th className="py-2.5 px-3 border border-[#236881]">Waktu Unggah</th>
                      <th className="py-2.5 px-3 border border-[#236881]">Status</th>
                      <th className="py-2.5 px-3 border border-[#236881] text-right">Aksi Pemeriksaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data?.reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-cyan-50/50 transition-colors">
                        {/* Klik Nama Entitas langsung membuka isi spreadsheet di sistem */}
                        <td className="py-2.5 px-3 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(rep.id)}
                            className="text-left group cursor-pointer"
                            title="Klik untuk membuka isi laporan di dalam sistem"
                          >
                            <p className="font-bold text-[#0c4a55] group-hover:underline text-xs flex items-center gap-1.5">
                              <span>📄</span>
                              <span>{rep.user.name}</span>
                              <span className="text-3xs bg-cyan-100 text-cyan-800 px-1 py-0.2 rounded-none font-bold uppercase">
                                Buka
                              </span>
                            </p>
                            <p className="text-2xs text-slate-500 mt-0.5">{rep.user.email}</p>
                          </button>
                        </td>

                        <td className="py-2.5 px-3 border border-slate-200 font-mono text-slate-700">
                          {rep.user.identifier}
                        </td>

                        <td className="py-2.5 px-3 border border-slate-200 text-slate-600">
                          {formatWib(rep.uploaded_at)}
                        </td>

                        <td className="py-2.5 px-3 border border-slate-200">
                          {rep.status === "reviewed" ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-2xs rounded-none border border-emerald-300">
                              Sudah Diperiksa ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-2xs rounded-none border border-amber-300">
                              Menunggu Pemeriksaan
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 border border-slate-200 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(rep.id)}
                            className="bg-[#2d7d9a] hover:bg-[#236881] text-white px-2.5 py-1 text-2xs font-bold uppercase rounded-none transition-colors"
                          >
                            Buka Laporan
                          </button>

                          {rep.status !== "reviewed" ? (
                            <button
                              type="button"
                              onClick={() => setReviewingId(rep.id)}
                              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 text-2xs font-bold uppercase rounded-none transition-colors"
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
            data?.unsubmitted_reporters.length === 0 ? (
              <div className="py-12 text-center text-emerald-700 font-bold text-xs">
                Seluruh entitas PBOT telah menyerahkan laporan untuk periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#dd4b39] text-white uppercase text-2xs font-bold">
                      <th className="py-2.5 px-3 border border-[#c23321]">Nama Entitas PBOT</th>
                      <th className="py-2.5 px-3 border border-[#c23321]">ID Akun</th>
                      <th className="py-2.5 px-3 border border-[#c23321]">Email Korespondensi</th>
                      <th className="py-2.5 px-3 border border-[#c23321] text-right">Status Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data?.unsubmitted_reporters.map((usr) => (
                      <tr key={usr.id} className="hover:bg-red-50/50">
                        <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-800">
                          {usr.name}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 font-mono text-slate-600">
                          {usr.identifier}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-slate-600">
                          {usr.email}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right">
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-2xs rounded-none border border-red-300">
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
          <div className="bg-white rounded-none border-2 border-[#0c4a55] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="bg-[#0c4a55] text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 text-slate-900 font-black text-xs flex items-center justify-center rounded-none">
                  XLS
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider truncate max-w-xl">
                    {previewData?.report.reporter_name || "Pemeriksaan Berkas Laporan"}
                  </h2>
                  <p className="text-2xs text-slate-300 font-mono">
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
                  className="bg-black/30 hover:bg-black/50 text-white px-3 py-1 text-xs font-bold rounded-none uppercase transition-colors"
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            {/* Isi Konten Sheet */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#ecf0f5]">
              {previewLoading ? (
                <div className="py-20 text-center text-slate-600 text-xs">
                  <div className="animate-spin w-6 h-6 border-2 border-[#0c4a55] border-t-transparent mx-auto mb-2 rounded-none"></div>
                  Membaca dan memproses tabel spreadsheet laporan...
                </div>
              ) : previewError ? (
                <div className="p-6 bg-red-50 border border-red-300 text-red-700 text-xs">
                  {previewError}
                </div>
              ) : previewData ? (
                <>
                  {/* Kartu Ringkasan Data Angka */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="bg-white p-3 border border-slate-300 rounded-none shadow-2xs">
                      <span className="text-3xs uppercase font-bold text-slate-400">Total Baris</span>
                      <p className="text-base font-extrabold text-slate-800">{previewData.sheetData.summary.total_items}</p>
                    </div>
                    <div className="bg-white p-3 border border-slate-300 rounded-none shadow-2xs">
                      <span className="text-3xs uppercase font-bold text-slate-400">Total Stok Awal</span>
                      <p className="text-base font-extrabold text-slate-800">{previewData.sheetData.summary.total_stok_awal.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3 border border-slate-300 rounded-none shadow-2xs">
                      <span className="text-3xs uppercase font-bold text-emerald-600">Total Pemasukan</span>
                      <p className="text-base font-extrabold text-emerald-700">{previewData.sheetData.summary.total_pemasukan.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3 border border-slate-300 rounded-none shadow-2xs">
                      <span className="text-3xs uppercase font-bold text-blue-600">Total Pengeluaran</span>
                      <p className="text-base font-extrabold text-blue-700">{previewData.sheetData.summary.total_pengeluaran.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-white p-3 border border-slate-300 rounded-none shadow-2xs">
                      <span className="text-3xs uppercase font-bold text-slate-500">Sisa Stok Akhir</span>
                      <p className="text-base font-extrabold text-purple-700">{previewData.sheetData.summary.total_sisa_stok.toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  {/* Judul Sheet Resmi */}
                  <div className="bg-white px-4 py-2 border border-slate-300 font-bold text-xs text-slate-800">
                    {previewData.sheetData.title}
                  </div>

                  {/* TABEL SPREADSHEET 18 KOLOM RESMI */}
                  <div className="bg-white border border-slate-300 rounded-none overflow-x-auto shadow-xs">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#0f766e] text-white font-bold">
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2">NO</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2">NIE</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-3 py-2 text-left">NAMA PRODUK</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2 text-left">KEMASAN</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2">STOK AWAL</th>
                          <th colSpan={2} className="border border-[#0d5f58] px-2 py-1 bg-[#115e59]">JUMLAH PEMASUKAN</th>
                          <th colSpan={9} className="border border-[#0d5f58] px-2 py-1 bg-[#115e59]">JUMLAH PENGELUARAN</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2">Sisa Stok</th>
                          <th rowSpan={2} className="border border-[#0d5f58] px-2 py-2">HNA</th>
                        </tr>
                        <tr className="bg-[#134e4a] text-white text-2xs font-semibold">
                          {/* Pemasukan */}
                          <th className="border border-[#0d5f58] px-2 py-1">IOT</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Lainnya</th>
                          {/* Pengeluaran */}
                          <th className="border border-[#0d5f58] px-2 py-1">Pedagang eceran</th>
                          <th className="border border-[#0d5f58] px-2 py-1">RS</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Apotek</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Sarana Pemerintah</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Puskesmas</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Klinik</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Toko Obat</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Retur</th>
                          <th className="border border-[#0d5f58] px-2 py-1">Lainnya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-2xs">
                        {previewData.sheetData.rows.length === 0 ? (
                          <tr>
                            <td colSpan={18} className="py-6 text-center text-slate-400">
                              Tidak ada data baris yang terisi.
                            </td>
                          </tr>
                        ) : (
                          previewData.sheetData.rows.map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              <td className="border border-slate-200 px-2 py-1.5 text-center text-slate-500 font-sans">{r.no}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-center">{r.nie}</td>
                              <td className="border border-slate-200 px-3 py-1.5 text-left font-sans font-semibold text-slate-800">{r.nama_produk}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-left font-sans">{r.kemasan}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.stok_awal.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.masuk_iot.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.masuk_lainnya.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_pedagang_eceran.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_rs.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_apotek.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_sarana_pemerintah.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_puskesmas.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_klinik.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_toko_obat.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_retur.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.keluar_lainnya.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right font-bold text-purple-800 bg-purple-50/50">{r.sisa_stok.toLocaleString("id-ID")}</td>
                              <td className="border border-slate-200 px-2 py-1.5 text-right">{r.hna}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Penanggung Jawab Footer */}
                  <div className="bg-white p-4 border border-slate-300 text-xs">
                    <p className="font-bold text-slate-800">Penanggung Jawab PBOT:</p>
                    <p className="text-slate-700 mt-1">Nama : {previewData.sheetData.signer.penanggung_jawab}</p>
                    <p className="text-slate-500 font-mono text-2xs mt-0.5">SIPTTK / STRA : {previewData.sheetData.signer.sipttk}</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-white border-t border-slate-300 p-3 px-5 flex items-center justify-between shrink-0">
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
                    className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 text-xs font-bold uppercase rounded-none transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? "Memproses..." : "✓ Tandai Telah Diperiksa"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewReportId(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 text-xs font-bold uppercase rounded-none transition-colors"
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
          <div className="bg-white border-2 border-slate-400 rounded-none max-w-md w-full p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Konfirmasi Pemeriksaan Laporan
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin telah memeriksa kelengkapan dan kebenaran berkas laporan ini?
              Status laporan akan diubah menjadi <strong>Sudah Diperiksa (reviewed)</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingId(null)}
                className="px-4 py-2 text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-none"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleMarkReviewed(reviewingId)}
                className="px-4 py-2 text-xs font-bold uppercase bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-none disabled:opacity-50"
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
