import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import ExcelJS from "exceljs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(Role.admin);
    const { id } = await context.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            identifier: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Berkas laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    const storage = getStorageProvider();
    let buffer: Buffer;

    try {
      buffer = await storage.downloadFile(report.file_path);
    } catch {
      // Fallback ke template default jika berkas belum tersinkronisasi di storage lokal
      const { generateOfficialTemplateBuffer } = await import("@/lib/excel-template");
      buffer = await generateOfficialTemplateBuffer(
        `PELAPORAN DISTRIBUSI OBAT TRADISIONAL — ${report.user.name.toUpperCase()} (PERIODE TAHUN ${report.period_year} SEMESTER ${report.period_semester})`
      );
    }

    // Parsing isi workbook Excel
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (parseErr) {
      console.warn("Gagal parse xlsx dengan ExcelJS:", parseErr);
      return NextResponse.json(
        { message: "Format berkas Excel rusak atau tidak dapat dibaca." },
        { status: 422 }
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { message: "Sheet data laporan tidak ditemukan di dalam berkas Excel." },
        { status: 422 }
      );
    }

    // Ambil judul di Baris 1
    const rawTitle = worksheet.getRow(1).getCell(1).text || "PELAPORAN OBAT TRADISIONAL";

    // Ambil data dari baris 5 s.d baris terakhir
    const rows: Array<{
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
    }> = [];

    let totalStokAwal = 0;
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalSisaStok = 0;

    let penanggungJawab = "";
    let sipttk = "";

    const parseNum = (val: ExcelJS.CellValue): number => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const clean = val.replace(/[^\d.-]/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      }
      if (val && typeof val === "object" && "result" in val) {
        return typeof val.result === "number" ? val.result : 0;
      }
      return 0;
    };

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Baris tanda tangan di bawah
      const colBText = row.getCell(2).text?.trim();
      if (colBText?.startsWith("Nama :")) {
        penanggungJawab = colBText.replace("Nama :", "").trim();
      }
      if (colBText?.startsWith("SIPTTK") || colBText?.startsWith("STRA")) {
        sipttk = colBText.replace(/^(SIPTTK|STRA)\s*:\s*/i, "").trim();
      }

      if (rowNumber >= 5) {
        const colNo = row.getCell(1).value;
        const colNie = row.getCell(2).text?.trim() || "";
        const colNamaProduk = row.getCell(3).text?.trim() || "";
        const colKemasan = row.getCell(4).text?.trim() || "";

        // Hanya masukkan baris yang memiliki data atau nomor
        if (colNamaProduk || colNie || (typeof colNo === "number" && colNo <= 50)) {
          const stokAwal = parseNum(row.getCell(5).value);
          const masukIot = parseNum(row.getCell(6).value);
          const masukLainnya = parseNum(row.getCell(7).value);
          const keluarPedagang = parseNum(row.getCell(8).value);
          const keluarRs = parseNum(row.getCell(9).value);
          const keluarApotek = parseNum(row.getCell(10).value);
          const keluarSarana = parseNum(row.getCell(11).value);
          const keluarPuskesmas = parseNum(row.getCell(12).value);
          const keluarKlinik = parseNum(row.getCell(13).value);
          const keluarToko = parseNum(row.getCell(14).value);
          const keluarRetur = parseNum(row.getCell(15).value);
          const keluarLainnya = parseNum(row.getCell(16).value);

          // Sisa Stok dihitung atau diambil dari formula
          let sisaStok = parseNum(row.getCell(17).value);
          const pemasukanSub = masukIot + masukLainnya;
          const pengeluaranSub =
            keluarPedagang +
            keluarRs +
            keluarApotek +
            keluarSarana +
            keluarPuskesmas +
            keluarKlinik +
            keluarToko +
            keluarRetur +
            keluarLainnya;

          if (sisaStok === 0 && (stokAwal > 0 || pemasukanSub > 0)) {
            sisaStok = stokAwal + pemasukanSub - pengeluaranSub;
          }

          const hna = row.getCell(18).text?.trim() || parseNum(row.getCell(18).value);

          totalStokAwal += stokAwal;
          totalPemasukan += pemasukanSub;
          totalPengeluaran += pengeluaranSub;
          totalSisaStok += sisaStok;

          rows.push({
            no: typeof colNo === "number" ? colNo : rows.length + 1,
            nie: colNie || "-",
            nama_produk: colNamaProduk || "Produk #" + (rows.length + 1),
            kemasan: colKemasan || "-",
            stok_awal: stokAwal,
            masuk_iot: masukIot,
            masuk_lainnya: masukLainnya,
            keluar_pedagang_eceran: keluarPedagang,
            keluar_rs: keluarRs,
            keluar_apotek: keluarApotek,
            keluar_sarana_pemerintah: keluarSarana,
            keluar_puskesmas: keluarPuskesmas,
            keluar_klinik: keluarKlinik,
            keluar_toko_obat: keluarToko,
            keluar_retur: keluarRetur,
            keluar_lainnya: keluarLainnya,
            sisa_stok: sisaStok,
            hna: typeof hna === "number" ? (hna > 0 ? `Rp ${hna.toLocaleString("id-ID")}` : "-") : hna || "-",
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        reporter_name: report.user.name,
        reporter_identifier: report.user.identifier,
        reporter_email: report.user.email,
        period_year: report.period_year,
        period_semester: report.period_semester,
        uploaded_at: report.uploaded_at,
        status: report.status,
        reviewed_at: report.reviewed_at,
        original_filename: report.original_filename,
      },
      sheetData: {
        title: rawTitle,
        sheet_name: worksheet.name,
        rows,
        summary: {
          total_items: rows.length,
          total_stok_awal: totalStokAwal,
          total_pemasukan: totalPemasukan,
          total_pengeluaran: totalPengeluaran,
          total_sisa_stok: totalSisaStok,
        },
        signer: {
          penanggung_jawab: penanggungJawab || "Apoteker / TTK Penanggung Jawab",
          sipttk: sipttk || "-",
        },
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/admin/reports/:id/preview error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat membaca berkas laporan." },
      { status: 500 }
    );
  }
}
