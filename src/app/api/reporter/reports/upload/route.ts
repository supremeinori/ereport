import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role, ReportStatus, BackupStatus } from "@prisma/client";
import { validateExcelReportFile } from "@/lib/file-validator";
import { getStorageProvider } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    // SEC-05, SEC-07: Otorisasi role reporter
    const user = await requireRole(Role.reporter);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const yearStr = formData.get("period_year") as string | null;
    const semesterStr = formData.get("period_semester") as string | null;

    if (!file || !yearStr || !semesterStr) {
      return NextResponse.json(
        { message: "Berkas laporan, tahun periode, dan semester wajib diisi." },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr, 10);
    const semester = parseInt(semesterStr, 10);

    // Validasi Tahun & Semester (FR-REP-05, CHECK constraint)
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2020 || year > currentYear + 1) {
      return NextResponse.json(
        { message: `Tahun pelaporan harus berada dalam rentang tahun 2020 s.d. ${currentYear + 1}.` },
        { status: 400 }
      );
    }

    if (semester !== 1 && semester !== 2) {
      return NextResponse.json(
        { message: "Semester pelaporan hanya boleh bernilai 1 atau 2." },
        { status: 400 }
      );
    }

    // Baca buffer file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validasi format, ukuran, dan magic bytes (FILE-01, FILE-02, FILE-03, FILE-10)
    const validation = validateExcelReportFile(file.name, buffer, file.type);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.errorMessage || "Berkas tidak valid." },
        { status: 400 }
      );
    }

    const originalFilename = validation.sanitizedFilename || file.name;
    const storage = getStorageProvider();

    // Cek apakah laporan periode ini sudah pernah diunggah (Prosedur Penggantian Bagian 4.2)
    const existingReport = await prisma.report.findUnique({
      where: {
        user_id_period_year_period_semester: {
          user_id: user.id,
          period_year: year,
          period_semester: semester,
        },
      },
    });

    // FILE-04: Object key acak berbasis UUID
    const randomSuffix = crypto.randomUUID();
    const newObjectKey = `reports/${user.id}/${year}_sem${semester}_${randomSuffix}.xlsx`;

    // 1. Unggah file baru ke storage terlebih dahulu
    await storage.uploadFile(
      newObjectKey,
      buffer,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    let resultReport;
    const isReplacement = Boolean(existingReport);

    if (existingReport) {
      // 2. Prosedur penggantian: update database terlebih dahulu
      resultReport = await prisma.report.update({
        where: { id: existingReport.id },
        data: {
          file_path: newObjectKey,
          original_filename: originalFilename,
          uploaded_at: new Date(),
          status: ReportStatus.pending_review, // Reset status review
          reviewed_at: null,
        },
      });

      // Buat pencatatan backup baru berstatus pending (M7/BKP-01)
      await prisma.backup.create({
        data: {
          report_id: resultReport.id,
          provider: "google_drive",
          backup_status: BackupStatus.pending,
        },
      });

      // 3. Hapus berkas lama HANYA setelah record database berhasil diperbarui (Bagian 4.2)
      try {
        await storage.deleteFile(existingReport.file_path);
      } catch (delErr) {
        console.warn("Peringatan: Gagal menghapus berkas lama dari storage:", delErr);
      }
    } else {
      // Unggah pertama kali
      resultReport = await prisma.report.create({
        data: {
          user_id: user.id,
          period_year: year,
          period_semester: semester,
          file_path: newObjectKey,
          original_filename: originalFilename,
          status: ReportStatus.pending_review,
        },
      });

      // Buat pencatatan backup berstatus pending
      await prisma.backup.create({
        data: {
          report_id: resultReport.id,
          provider: "google_drive",
          backup_status: BackupStatus.pending,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: isReplacement
          ? `Laporan periode ${year} Semester ${semester} berhasil diperbarui.`
          : `Laporan periode ${year} Semester ${semester} berhasil diunggah.`,
        report: {
          id: resultReport.id,
          period_year: resultReport.period_year,
          period_semester: resultReport.period_semester,
          original_filename: resultReport.original_filename,
          uploaded_at: resultReport.uploaded_at,
          status: resultReport.status,
        },
        is_replacement: isReplacement,
      },
      { status: isReplacement ? 200 : 201 }
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("POST /api/reporter/reports/upload error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses unggahan laporan." },
      { status: 500 }
    );
  }
}
