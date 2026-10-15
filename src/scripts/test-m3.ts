import { PrismaClient, Role, ReportStatus, BackupStatus } from "@prisma/client";
import { validateExcelReportFile } from "../lib/file-validator";
import { MemoryStorageProvider } from "../lib/storage/memory-storage";
import crypto from "crypto";

const prisma = new PrismaClient();
const storage = new MemoryStorageProvider();

async function runTests() {
  console.log("==========================================");
  console.log("MEMULAI PENGUJIAN OTOMATIS MODUL M3");
  console.log("==========================================\n");

  let allPassed = true;

  // 1. Persiapan Akun Reporter Uji
  const testReporterEmail = "reporter-m3@test.local";
  console.log("1. Menyiapkan akun reporter uji...");
  await prisma.user.deleteMany({
    where: { email: testReporterEmail },
  });

  const reporter = await prisma.user.create({
    data: {
      identifier: "TEST-PBOT-M3",
      name: "PT Herbal Minang Sejahtera",
      email: testReporterEmail,
      password_hash: "dummyhash",
      role: Role.reporter,
      is_active: true,
    },
  });

  // 2. UJI TST-09: Validasi Berkas Excel
  console.log("2. Uji TST-09: Validasi format berkas, ukuran, dan magic bytes...");

  // Mock valid XLSX buffer (starts with ZIP signature: PK\x03\x04)
  const validXlsxBuffer = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0x08, 0x00, 0x00, 0x00,
  ]);

  // Valid file test
  const validResult = validateExcelReportFile("Laporan_2026_Sem1.xlsx", validXlsxBuffer);
  if (validResult.isValid) {
    console.log("   [LULUS] TST-09: Berkas .xlsx dengan magic bytes ZIP valid diterima.");
  } else {
    console.error("   [GAGAL] TST-09: Berkas valid ditolak:", validResult.errorMessage);
    allPassed = false;
  }

  // Invalid extension test (.pdf)
  const invalidExtResult = validateExcelReportFile("Laporan.pdf", validXlsxBuffer);
  if (!invalidExtResult.isValid) {
    console.log("   [LULUS] TST-09: Berkas ekstensi non-xlsx (.pdf) ditolak.");
  } else {
    console.error("   [GAGAL] TST-09: Berkas ekstensi salah diterima!");
    allPassed = false;
  }

  // Macro-enabled file test (.xlsm - FILE-10)
  const macroResult = validateExcelReportFile("Laporan.xlsm", validXlsxBuffer);
  if (!macroResult.isValid) {
    console.log("   [LULUS] TST-09: Berkas macro (.xlsm) ditolak secara eksplisit.");
  } else {
    console.error("   [GAGAL] TST-09: Berkas macro diterima!");
    allPassed = false;
  }

  // Fake XLSX test (wrong magic bytes)
  const fakeXlsxBuffer = Buffer.from("Ini teks biasa bukan berkas zip excel");
  const fakeResult = validateExcelReportFile("Laporan_Palsu.xlsx", fakeXlsxBuffer);
  if (!fakeResult.isValid) {
    console.log("   [LULUS] TST-09: Berkas ekstensi .xlsx tetapi isi bukan ZIP/xlsx ditolak.");
  } else {
    console.error("   [GAGAL] TST-09: Berkas palsu diterima!");
    allPassed = false;
  }

  // Over-sized file test (>10MB)
  const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
  oversizedBuffer[0] = 0x50;
  oversizedBuffer[1] = 0x4b;
  oversizedBuffer[2] = 0x03;
  oversizedBuffer[3] = 0x04;
  const oversizedResult = validateExcelReportFile("Laporan_Besar.xlsx", oversizedBuffer);
  if (!oversizedResult.isValid) {
    console.log("   [LULUS] TST-09: Berkas melebihi 10MB ditolak.");
  } else {
    console.error("   [GAGAL] TST-09: Berkas ukuran melebihi batas diterima!");
    allPassed = false;
  }

  // 3. UJI TST-08: Alur Unggah Pertama & Unique Constraint
  console.log("3. Uji TST-08: Unggah pertama dan integritas status awal...");
  const year = 2026;
  const semester = 1;
  const initialObjectKey = `reports/${reporter.id}/${year}_sem${semester}_${crypto.randomUUID()}.xlsx`;

  // Simpan ke storage
  await storage.uploadFile(initialObjectKey, validXlsxBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  const report1 = await prisma.report.create({
    data: {
      user_id: reporter.id,
      period_year: year,
      period_semester: semester,
      file_path: initialObjectKey,
      original_filename: "Laporan_Distribusi_2026_Sem1.xlsx",
      status: ReportStatus.pending_review,
    },
  });

  // Pencatatan backup pending (BKP-01)
  const backup1 = await prisma.backup.create({
    data: {
      report_id: report1.id,
      provider: "google_drive",
      backup_status: BackupStatus.pending,
    },
  });

  if (report1.status === ReportStatus.pending_review && backup1.backup_status === BackupStatus.pending) {
    console.log("   [LULUS] TST-08: Laporan berhasil dibuat dengan status awal 'pending_review' & backup 'pending'.");
  } else {
    console.error("   [GAGAL] TST-08: Status awal tidak sesuai spesifikasi.");
    allPassed = false;
  }

  // Verifikasi UNIQUE constraint mencegah insert duplikat langsung
  try {
    await prisma.report.create({
      data: {
        user_id: reporter.id,
        period_year: year,
        period_semester: semester,
        file_path: "duplicate.xlsx",
        original_filename: "duplicate.xlsx",
      },
    });
    console.error("   [GAGAL] TST-08: Database mengizinkan duplikasi periode yang sama!");
    allPassed = false;
  } catch {
    console.log("   [LULUS] TST-08: UNIQUE constraint (user_id, period_year, period_semester) berhasil mencegah laporan ganda.");
  }

  // 4. UJI Penggantian Berkas yang Aman (Bagian 4.2)
  console.log("4. Uji Penggantian Berkas Aman (Unggah Ulang)...");
  const newObjectKey = `reports/${reporter.id}/${year}_sem${semester}_${crypto.randomUUID()}.xlsx`;
  await storage.uploadFile(newObjectKey, validXlsxBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  const oldFilePath = report1.file_path;

  // Update record database
  const updatedReport = await prisma.report.update({
    where: { id: report1.id },
    data: {
      file_path: newObjectKey,
      original_filename: "Laporan_Distribusi_2026_Sem1_Revisi.xlsx",
      uploaded_at: new Date(),
      status: ReportStatus.pending_review,
      reviewed_at: null,
    },
  });

  // Hapus berkas lama dari storage SETELAH database berhasil diupdate
  await storage.deleteFile(oldFilePath);

  if (updatedReport.file_path === newObjectKey && updatedReport.original_filename.includes("Revisi")) {
    console.log("   [LULUS] Prosedur penggantian berkas aman berjalan sukses.");
  } else {
    console.error("   [GAGAL] Penggantian berkas gagal.");
    allPassed = false;
  }

  // 5. Bersihkan data uji
  console.log("5. Membersihkan data uji...");
  await prisma.backup.deleteMany({ where: { report_id: report1.id } });
  await prisma.report.deleteMany({ where: { user_id: reporter.id } });
  await prisma.user.delete({ where: { id: reporter.id } });

  console.log("\n==========================================");
  if (allPassed) {
    console.log("SEMUA PENGUJIAN MODUL M3 LULUS DENGAN BAIK!");
  } else {
    console.error("BEBERAPA PENGUJIAN MODUL M3 GAGAL!");
    process.exit(1);
  }
  console.log("==========================================");
}

runTests()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
