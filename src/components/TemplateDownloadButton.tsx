"use client";

import { useState } from "react";

interface TemplateDownloadButtonProps {
  label?: string;
  variant?: "primary" | "secondary";
}

export default function TemplateDownloadButton({
  label = "Unduh Template Resmi",
  variant = "secondary",
}: TemplateDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/template/download");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Template belum tersedia.");
      }

      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.filename || "Template_Laporan_PBOBA.xlsx";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClass = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variantClass =
    variant === "primary"
      ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-500/25"
      : "text-purple-700 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/80 shadow-xs";


  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className={`${baseClass} ${variantClass}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Menyiapkan Template...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600 max-w-xs">{error}</span>
      )}
    </div>
  );
}
