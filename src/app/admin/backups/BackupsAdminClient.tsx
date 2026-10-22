"use client";

import { useState, useEffect, useCallback } from "react";
import { badge, btnQuiet, btnSmallQuiet, pageSubtitle, pageTitle, panel, th, td } from "@/components/ui";

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

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "success", label: "Sukses" },
  { key: "pending", label: "Antrean" },
  { key: "failed", label: "Gagal" },
] as const;

const STATUS_BADGE: Record<BackupItem["backup_status"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
};

const STATUS_LABEL: Record<BackupItem["backup_status"], string> = {
  success: "Tersimpan",
  pending: "Dalam antrean",
  failed: "Gagal",
};

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

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className={`${panel} p-6`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={pageTitle}>Pemantauan Cadangan Google Drive</h1>
            <p className={pageSubtitle}>
              Status pencadangan arsip berkas laporan semester ke penyimpanan sekunder eksternal (Google Drive).
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-line bg-canvas p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterStatus(f.key)}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                  filterStatus === f.key
                    ? "bg-surface text-purple-900 shadow-panel"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Konfigurasi Google Drive */}
      <div
        className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
          data?.is_configured
            ? "border-emerald-200 bg-emerald-50"
            : "border-purple-200 bg-purple-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
              data?.is_configured ? "bg-emerald-600" : "bg-purple-600"
            }`}
          />
          <div>
            <p className="text-sm font-semibold text-ink">
              {data?.is_configured
                ? "Integrasi Google Drive aktif dan terkonfigurasi"
                : "Integrasi Google Drive belum dikonfigurasi (opsional)"}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {data?.is_configured
                ? "Service Account dan Folder ID siap menerima salinan arsip cadangan."
                : "Sistem pelaporan utama dan penyimpanan Supabase Storage tetap beroperasi normal. Kredensial Google Drive dapat ditambahkan sewaktu-waktu pada environment server."}
            </p>
          </div>
        </div>

        <button type="button" onClick={fetchBackups} disabled={loading} className={btnQuiet}>
          {loading ? "Memuat..." : "Segarkan"}
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-4 text-sm font-semibold ${
            feedback.type === "success"
              ? "border-purple-200 bg-purple-50 text-purple-900"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-4 text-xs underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Ledger Arsip Cadangan */}
      <div className={`${panel} grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x`}>
        <div className="p-5">
          <p className="text-xs font-medium text-ink-soft">Total arsip cadangan</p>
          <p className="tabular mt-2 text-3xl font-bold text-ink">{summary?.total ?? 0}</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-ink-soft">Berhasil dicadangkan</p>
          <p className="tabular mt-2 text-3xl font-bold text-emerald-700">{summary?.success ?? 0}</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-ink-soft">Menunggu antrean</p>
          <p className="tabular mt-2 text-3xl font-bold text-amber-700">{summary?.pending ?? 0}</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-ink-soft">Perlu tindak lanjut</p>
          <p className="tabular mt-2 text-3xl font-bold text-rose-700">{summary?.failed ?? 0}</p>
        </div>
      </div>

      {/* Tabel Riwayat Backup */}
      <div className={panel}>
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-bold text-ink">Riwayat pencadangan</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Setiap unggahan laporan semester tercatat di sini sebagai antrean pencadangan arsip.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-soft">
            <svg className="h-5 w-5 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Memuat riwayat arsip cadangan...
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-rose-700">{error}</div>
        ) : data?.backups.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">Belum ada data cadangan dalam kategori ini.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Setiap kali pelapor mengunggah laporan semester, antrean pencadangan otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Entitas PBOT</th>
                  <th className={th}>Periode</th>
                  <th className={th}>Nama berkas</th>
                  <th className={th}>Status cadangan</th>
                  <th className={th}>Rincian Drive / catatan</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.backups.map((bkp) => (
                  <tr key={bkp.id} className="transition-colors hover:bg-purple-50/50">
                    <td className={td}>
                      <p className="font-semibold text-ink">{bkp.report.user.name}</p>
                      <p className="font-mono text-2xs text-purple-800">{bkp.report.user.identifier}</p>
                    </td>
                    <td className={`${td} font-mono text-xs`}>
                      {bkp.report.period_year} - Sem. {bkp.report.period_semester}
                    </td>
                    <td className={`${td} max-w-xs truncate font-mono text-xs text-ink-soft`}>
                      {bkp.report.original_filename}
                    </td>
                    <td className={td}>
                      <span className={`${badge} ${STATUS_BADGE[bkp.backup_status]}`}>
                        {STATUS_LABEL[bkp.backup_status]}
                      </span>
                    </td>
                    <td className={`${td} text-xs text-ink-soft`}>
                      {bkp.backup_status === "success" ? (
                        <div>
                          <p className="font-mono text-2xs text-ink">ID: {bkp.drive_file_id}</p>
                          <p className="mt-0.5 text-2xs text-ink-soft">{formatWib(bkp.backed_up_at)}</p>
                        </div>
                      ) : bkp.error_message ? (
                        <span className="text-xs leading-snug text-rose-700">{bkp.error_message}</span>
                      ) : (
                        <span className="text-xs text-ink-soft">Menunggu eksekusi</span>
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      {bkp.backup_status !== "success" && (
                        <button
                          type="button"
                          onClick={() => handleRetry(bkp.id)}
                          disabled={retryingId === bkp.id}
                          className={btnSmallQuiet}
                        >
                          {retryingId === bkp.id ? "Memproses..." : "Coba ulang"}
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