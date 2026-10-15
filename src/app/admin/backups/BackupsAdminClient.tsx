"use client";

import { useState, useEffect, useCallback } from "react";

interface BackupItem {
  id: string;
  report_id: string;
  provider: string;
  drive_file_id: string | null;
  backup_status: "pending" | "success" | "failed";
  backed_up_at: string | null;
  error_message: string | null;
  created_at: string;
  report: {
    id: string;
    period_year: number;
    period_semester: number;
    original_filename: string;
    uploaded_at: string;
    user: {
      id: string;
      name: string;
      identifier: string;
      email: string;
    };
  };
}

interface BackupsResponse {
  is_configured: boolean;
  summary: {
    total: number;
    pending: number;
    success: number;
    failed: number;
  };
  backups: BackupItem[];
}

export default function BackupsAdminClient() {
  const [data, setData] = useState<BackupsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "success" | "failed">("all");

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        filterStatus === "all"
          ? "/api/admin/backups"
          : `/api/admin/backups?status=${filterStatus}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Gagal mengambil data status backup.");
      }
      const json: BackupsResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleRetry = async (backupId: string) => {
    setRetryingId(backupId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/backups/${backupId}/retry`, {
        method: "POST",
      });
      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resJson.message || "Gagal memicu proses backup ulang.");
      }
      setFeedback({
        text: resJson.message || "Proses backup berhasil dijalankan ulang.",
        type: "success",
      });
      await fetchBackups();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const formatWib = (dateStr: string | null) => {
    if (!dateStr) return "-";
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
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pemantauan Cadangan Google Drive
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Status pencadangan arsip berkas laporan semester ke penyimpanan sekunder eksternal (Google Drive).
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus("success")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === "success"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sukses
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === "pending"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Antrean
          </button>
          <button
            onClick={() => setFilterStatus("failed")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterStatus === "failed"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Gagal
          </button>
        </div>
      </div>

      {/* Banner Status Konfigurasi Google Drive (BKP-04) */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          data?.is_configured
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-blue-50 border-blue-200 text-blue-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              data?.is_configured ? "bg-emerald-500 animate-pulse" : "bg-blue-400"
            }`}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">
              {data?.is_configured
                ? "Integrasi Google Drive: Aktif Terkonfigurasi"
                : "Integrasi Google Drive: Belum Dikonfigurasi (Opsional)"}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {data?.is_configured
                ? "Service Account & Folder ID siap menerima salinan arsip cadangan."
                : "Sistem pelaporan utama dan penyimpanan Supabase Storage tetap beroperasi 100% normal. Kredensial Google Drive dapat ditambahkan sewaktu-waktu pada environment server."}
            </p>
          </div>
        </div>

        <button
          onClick={fetchBackups}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          {loading ? "Memuat..." : "Segarkan"}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metrik Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Arsip Cadangan
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {data?.summary.total ?? 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Berhasil Dicadangkan
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {data?.summary.success ?? 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menunggu Antrean
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {data?.summary.pending ?? 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Perlu Tindak Lanjut
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {data?.summary.failed ?? 0}
          </p>
        </div>
      </div>

      {/* Tabel Riwayat Backup */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Memuat riwayat arsip cadangan...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 text-sm">{error}</div>
        ) : data?.backups.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Belum ada data cadangan dalam kategori ini.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Setiap kali pelapor mengunggah laporan semester, antrean pencadangan otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                  <th className="pb-3 px-3">Entitas PBOT</th>
                  <th className="pb-3 px-3">Periode</th>
                  <th className="pb-3 px-3">Nama Berkas</th>
                  <th className="pb-3 px-3">Status Cadangan</th>
                  <th className="pb-3 px-3">Rincian Drive / Catatan</th>
                  <th className="pb-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.backups.map((bkp) => (
                  <tr key={bkp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{bkp.report.user.name}</p>
                      <p className="text-xs font-mono text-slate-400">{bkp.report.user.identifier}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-700 font-medium">
                      {bkp.report.period_year} - Sem. {bkp.report.period_semester}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-slate-600 truncate max-w-xs">
                      {bkp.report.original_filename}
                    </td>
                    <td className="py-3 px-3">
                      {bkp.backup_status === "success" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Tersimpan ✓
                        </span>
                      ) : bkp.backup_status === "pending" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                          Dalam Antrean
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
                          Gagal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {bkp.backup_status === "success" ? (
                        <div>
                          <p className="font-mono text-[11px] text-slate-700">
                            ID: {bkp.drive_file_id}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatWib(bkp.backed_up_at)}
                          </p>
                        </div>
                      ) : bkp.error_message ? (
                        <span className="text-rose-600 text-xs line-clamp-2">
                          {bkp.error_message}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Menunggu eksekusi</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {bkp.backup_status !== "success" && (
                        <button
                          onClick={() => handleRetry(bkp.id)}
                          disabled={retryingId === bkp.id}
                          className="px-3 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors disabled:opacity-50"
                        >
                          {retryingId === bkp.id ? "Memproses..." : "Coba Ulang"}
                        </button>
                      )}
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
