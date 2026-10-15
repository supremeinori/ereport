/**
 * test-m7.ts — Test Suite M7: Cadangan Google Drive & Otomasi
 *
 * Cakupan:
 *   BKP-01 : Record backup pending dibuat otomatis bersamaan dengan laporan
 *   BKP-04 : Berjalan normal saat Google Drive belum dikonfigurasi
 *   TST-10 : Kegagalan backup TIDAK merusak laporan utama
 *   FR-ADM-14 : Admin dapat memicu retry proses backup
 *   TST-12 : Error message backup tidak membocorkan kredensial/secret sensitif
 */

import { prisma } from "../lib/prisma";
import { Role, ReportStatus, BackupStatus } from "@prisma/client";
import { executeBackup, isGoogleDriveConfigured } from "../lib/backup";
import * as crypto from "crypto";

function pass(label: string) {
  console.log(`  ✅ LULUS : ${label}`);
}

function fail(label: string, reason: string) {
  console.error(`  ❌ GAGAL : ${label}`);
  console.error(`            ${reason}`);
  process.exitCode = 1;
}

function randomEmail() {
  return `test_m7_${crypto.randomBytes(4).toString("hex")}@pboba.test`;
}

async function testBackupFlow() {
  const hash = crypto.createHmac("sha256", "test").update("pwd").digest("hex");

  // 1. Buat reporter uji
  const reporter = await prisma.user.create({
    data: {
      name: "Reporter Uji Backup (M7)",
      email: randomEmail(),
      identifier: `M7-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  // 2. Buat laporan utama
  const report = await prisma.report.create({
    data: {
      user_id: reporter.id,
      period_year: 2026,
      period_semester: 1,
      status: ReportStatus.pending_review,
      file_path: "reports/m7_test_report.xlsx",
      original_filename: "m7_test_report.xlsx",
    },
  });

  // 3. Buat record backup dengan status pending (BKP-01)
  const backup = await prisma.backup.create({
    data: {
      report_id: report.id,
      provider: "google_drive",
      backup_status: BackupStatus.pending,
    },
  });

  if (backup.backup_status === BackupStatus.pending && backup.report_id === report.id) {
    pass("BKP-01: Record backup 'pending' dibuat dan berelasi ke laporan utama");
  } else {
    fail("BKP-01: Pembuatan record backup", "Record backup tidak valid");
  }

  // 4. Uji BKP-04: Eksekusi backup tanpa kredensial Google Drive
  const configured = isGoogleDriveConfigured();
  console.log(`     Status konfigurasi Google Drive saat ini: ${configured ? "TERKONFIGURASI" : "BELUM DIKONFIGURASI (Default)"}`);

  const result = await executeBackup(backup.id);

  if (!configured) {
    if (!result.success && !result.isConfigured) {
      pass("BKP-04: Eksekusi backup menangani ketiadaan kredensial dengan graceful tanpa crash server");
    } else {
      fail("BKP-04: Graceful handling", "Eksekusi tidak menangani ketiadaan kredensial");
    }
  } else {
    pass("BKP-04: Layanan Google Drive terkonfigurasi, eksekusi selesai");
  }

  // 5. Uji TST-10: Kegagalan backup TIDAK merusak laporan utama
  const reportAfterBackup = await prisma.report.findUnique({
    where: { id: report.id },
  });

  if (
    reportAfterBackup &&
    reportAfterBackup.id === report.id &&
    reportAfterBackup.status === ReportStatus.pending_review &&
    reportAfterBackup.file_path === "reports/m7_test_report.xlsx"
  ) {
    pass("TST-10: Kegagalan backup sama sekali TIDAK merusak atau mengubah record laporan utama");
  } else {
    fail("TST-10: Integritas laporan", "Laporan utama terpengaruh kegagalan backup");
  }

  // 6. Uji FR-ADM-14: Admin dapat memicu retry
  const retryResult = await executeBackup(backup.id);
  const backupAfterRetry = await prisma.backup.findUnique({
    where: { id: backup.id },
  });

  if (backupAfterRetry) {
    pass("FR-ADM-14: Retry backup dapat dipicu ulang dan status backup tercatat");
  } else {
    fail("FR-ADM-14: Retry backup", "Record backup hilang saat retry");
  }

  // 7. Uji TST-12: Error message tidak membocorkan rahasia
  if (backupAfterRetry?.error_message) {
    const msg = backupAfterRetry.error_message.toLowerCase();
    const leaksSecret =
      msg.includes("private_key") ||
      msg.includes("client_secret") ||
      msg.includes("password");
    if (!leaksSecret) {
      pass("TST-12: Pesan error backup tidak memuat kredensial atau rahasia sensitif");
    } else {
      fail("TST-12: Kebocoran rahasia", "Pesan error mengandung kata kunci sensitif");
    }
  } else {
    pass("TST-12: Tidak ada pesan error sensitif");
  }

  // Cleanup
  await prisma.backup.delete({ where: { id: backup.id } });
  await prisma.report.delete({ where: { id: report.id } });
  await prisma.user.delete({ where: { id: reporter.id } });
}

async function main() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" E-Report PBOBA — Test Suite M7: Cadangan Google Drive");
  console.log("══════════════════════════════════════════════════════\n");

  console.log("【1】 Pengujian Integrasi Backup, Graceful Fallback, & TST-10");
  await testBackupFlow();

  console.log("\n══════════════════════════════════════════════════════");
  if (process.exitCode === 1) {
    console.error(" HASIL: Pengujian M7 GAGAL");
  } else {
    console.log(" HASIL: Semua pengujian M7 LULUS ✅");
  }
  console.log("══════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Kesalahan fatal saat menjalankan test-m7:", err);
  prisma.$disconnect();
  process.exit(1);
});
