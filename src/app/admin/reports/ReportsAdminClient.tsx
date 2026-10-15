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

export default function ReportsAdminClient() {
  const currentYear = new Date().getFullYear();
  const currentSemester = new Date().getMonth() < 6 ? 1 : 2;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester);
  const [activeTab, setActiveTab] = useState<"submitted" | "unsubmitted">("submitted");

  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      await fetchReports();
    } catch (err: unknown) {
      setFeedbackMsg({
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const formatWib = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date) + " WIB";
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Periode */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pemeriksaan Laporan Semester PBOT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau kepatuhan penyerahan berkas distribusi obat tradisional dan lakukan verifikasi laporan per semester.
          </p>
        </div>

        {/* Filter Tahun & Semester */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="selectYear" className="text-xs font-semibold text-slate-600">
              Tahun:
            </label>
            <select
              id="selectYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="selectSemester" className="text-xs font-semibold text-slate-600">
              Semester:
            </label>
            <select
              id="selectSemester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1}>Semester I (Jan - Jun)</option>
              <option value={2}>Semester II (Jul - Des)</option>
            </select>
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            {loading ? "Memuat..." : "Segarkan"}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Ringkasan Metrik Kepatuhan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total PBOT Aktif
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {data?.summary.total_reporters ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Wajib lapor periode ini</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Laporan Masuk
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {data?.summary.submitted_count ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {data?.summary.total_reporters
              ? Math.round(
                  ((data.summary.submitted_count) /
                    data.summary.total_reporters) *
                    100
                )
              : 0}
            % tingkat kepatuhan
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Belum Menyerahkan
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {data?.summary.unsubmitted_count ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Perlu tindak lanjut pembinaan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sudah Diperiksa
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {data?.summary.reviewed_count ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Dari {data?.summary.submitted_count ?? 0} berkas diterima
          </p>
        </div>
      </div>

      {/* Tab Konten: Laporan Masuk vs Belum Melapor */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("submitted")}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "submitted"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Berkas Laporan Masuk</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "submitted"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {data?.reports.length ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unsubmitted")}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "unsubmitted"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>Belum Melapor</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "unsubmitted"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {data?.unsubmitted_reporters.length ?? 0}
            </span>
          </button>
        </div>

        {/* Isi Tab */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Memuat data laporan periode {selectedYear} Semester {selectedSemester}...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-500 text-sm">{error}</div>
          ) : activeTab === "submitted" ? (
            /* TAB 1: LAPORAN MASUK */
            data?.reports.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada laporan yang masuk untuk Tahun {selectedYear} Semester {selectedSemester}.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Entitas pelapor belum mengunggah berkas laporan untuk periode ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3 px-3">Entitas PBOT</th>
                      <th className="pb-3 px-3">No. Izin / ID</th>
                      <th className="pb-3 px-3">Waktu Unggah</th>
                      <th className="pb-3 px-3">Berkas Laporan</th>
                      <th className="pb-3 px-3">Status Pemeriksaan</th>
                      <th className="pb-3 px-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{rep.user.name}</p>
                          <p className="text-xs text-slate-400">{rep.user.email}</p>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          {rep.user.identifier}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          {formatWib(rep.uploaded_at)}
                        </td>
                        <td className="py-3 px-3">
                          <DownloadButton
                            reportId={rep.id}
                            filename={rep.original_filename}
                          />
                        </td>
                        <td className="py-3 px-3">
                          {rep.status === "reviewed" ? (
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Sudah Diperiksa
                              </span>
                              {rep.reviewed_at && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {formatWib(rep.reviewed_at)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                              Menunggu Pemeriksaan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {rep.status !== "reviewed" ? (
                            <button
                              onClick={() => setReviewingId(rep.id)}
                              className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              Tandai Selesai
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              Terverifikasi ✓
                            </span>
                          )}
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
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-emerald-700">
                  Luar biasa! Seluruh entitas PBOT aktif telah menyerahkan laporan untuk Tahun {selectedYear} Semester {selectedSemester}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <th className="pb-3 px-3">Entitas PBOT</th>
                      <th className="pb-3 px-3">No. Izin / ID</th>
                      <th className="pb-3 px-3">Email Kontak</th>
                      <th className="pb-3 px-3">Status Entitas</th>
                      <th className="pb-3 px-3 text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.unsubmitted_reporters.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {usr.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          {usr.identifier}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          {usr.email}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
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

      {/* Modal Konfirmasi Tandai Selesai Diperiksa */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Konfirmasi Pemeriksaan Laporan
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin telah memeriksa kelengkapan dan kebenaran berkas laporan ini?
              Status laporan akan diubah menjadi <strong className="text-emerald-700">Sudah Diperiksa (reviewed)</strong> dan waktu verifikasi akan dicatat.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingId(null)}
                disabled={reviewLoading}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleMarkReviewed(reviewingId)}
                disabled={reviewLoading}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {reviewLoading ? "Menyimpan..." : "Ya, Tandai Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
