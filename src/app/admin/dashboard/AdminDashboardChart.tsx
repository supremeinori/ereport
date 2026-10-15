"use client";

import { useState } from "react";

interface AdminDashboardChartProps {
  monthlyData: { month: string; count: number }[];
  currentYear: number;
}

export default function AdminDashboardChart({
  monthlyData,
  currentYear,
}: AdminDashboardChartProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const maxCount = Math.max(...monthlyData.map((d) => d.count), 8);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-none shadow-xs mt-6">
      {/* Header Box Bernuansa Biru/Teal Tegas */}
      <div className="bg-[#2d7d9a] text-white px-4 py-2.5 flex items-center justify-between rounded-none">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Grafik Pelaporan Distribusi Obat Tradisional ( Tahun {selectedYear} )
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="text-2xs bg-[#0c4a55] px-2 py-0.5 rounded-none font-semibold">
            BBPOM Padang
          </span>
        </div>
      </div>

      {/* Filter Toolbar Sesuai Screenshot AdminLTE */}
      <div className="p-4 border-b border-slate-200 bg-[#fafafa] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#2d7d9a]"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            className="bg-[#2d7d9a] hover:bg-[#236881] text-white p-1.5 rounded-none text-xs flex items-center justify-center transition-colors"
            title="Cari"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded-none text-xs font-bold transition-colors flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-5 h-3 bg-[#00a65a] inline-block rounded-none"></span>
          <span>Volume Laporan PBOT</span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="p-6">
        <div className="relative h-64 flex items-end justify-between gap-2 border-b border-l border-slate-300 pb-2 pl-3">
          {/* Y Axis Grid lines */}
          <div className="absolute inset-x-3 top-0 border-b border-dashed border-slate-200 text-3xs text-slate-400">
            {maxCount}
          </div>
          <div className="absolute inset-x-3 top-1/2 border-b border-dashed border-slate-200 text-3xs text-slate-400">
            {Math.round(maxCount / 2)}
          </div>

          {/* Monthly Bars */}
          {months.map((m, idx) => {
            const dataItem = monthlyData[idx] || { count: 0 };
            const heightPercent = maxCount > 0 ? (dataItem.count / maxCount) * 100 : 0;
            const barHeight = Math.max(heightPercent, dataItem.count > 0 ? 8 : 2);

            return (
              <div key={m} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Bar Value Tooltip */}
                <span className="text-3xs font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {dataItem.count}
                </span>

                {/* The Green Bar (AdminLTE sharp green) */}
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-full max-w-[42px] transition-all duration-300 ${
                    dataItem.count > 0
                      ? "bg-[#00a65a] hover:bg-[#008d4c] shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200"
                  } rounded-none`}
                />

                {/* Month Label */}
                <span className="text-3xs text-slate-600 mt-2 truncate max-w-[48px] text-center">
                  {m}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
