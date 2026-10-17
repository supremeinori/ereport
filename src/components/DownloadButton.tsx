"use client";

import { useState } from "react";

interface DownloadButtonProps {
  reportId: string;
  filename: string;
  label?: string;
  variant?: "primary" | "secondary";
}

export default function DownloadButton({
  reportId,
  filename,
  label = "Unduh",
  variant = "secondary",
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${reportId}/download`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengunduh laporan.");
      }

      // Buka signed URL di tab baru (URL berumur 60 detik)
      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.filename || filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClass = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variantClass =
    variant === "primary"
      ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-500/20"
      : "text-purple-700 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/80";


  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className={`${baseClass} ${variantClass}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Menyiapkan...</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-2xs text-red-600">{error}</span>
      )}
    </div>
  );
}
