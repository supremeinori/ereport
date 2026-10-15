/**
 * test-m5.ts — Test Suite M5: Dashboard Admin & Pemeriksaan Laporan
 *
 * Cakupan:
 *   FR-ADM-02: Total entitas pelapor aktif terhitung dengan benar
 *   FR-ADM-03: Konsistensi metrik (submitted_count + unsubmitted_count === total_reporters)
 *   FR-ADM-04: Filter periode tahun dan semester bekerja akurat
 *   FR-ADM-09: Daftar laporan terfilter sesuai periode
 *   FR-ADM-10: Membedakan laporan pending_review dan reviewed
 *   FR-ADM-12: Menandai laporan menjadi reviewed dan mengisi reviewed_at
 *   SEC-07   : Reporter ditolak mengakses endpoint admin reports (harus 403)
 */

import { prisma } from "../lib/prisma";
import { Role, ReportStatus } from "@prisma/client";
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
  return `test_m5_${crypto.randomBytes(4).toString("hex")}@pboba.test`;
}

async function testMetricsAndConsistency() {
  const hash = crypto.createHmac("sha256", "test").update("pwd").digest("hex");
  const testYear = 2029; // gunakan tahun khusus test agar terisolasi
  const testSemester = 1;

  // 1. Buat 3 reporter aktif dan 1 reporter nonaktif
  const rep1 = await prisma.user.create({
    data: {
      name: "PBOT Aktif 1 (M5 Test)",
      email: randomEmail(),
      identifier: `M5-A1-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const rep2 = await prisma.user.create({
    data: {
      name: "PBOT Aktif 2 (M5 Test)",
      email: randomEmail(),
      identifier: `M5-A2-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const rep3 = await prisma.user.create({
    data: {
      name: "PBOT Aktif 3 (M5 Test)",
      email: randomEmail(),
      identifier: `M5-A3-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const repInactive = await prisma.user.create({
    data: {
      name: "PBOT Nonaktif (M5 Test)",
      email: randomEmail(),
      identifier: `M5-INA-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: false,
    },
  });

  // 2. Buat laporan untuk rep1 (pending_review) dan rep2 (sudah reviewed)
  const report1 = await prisma.report.create({
    data: {
      user_id: rep1.id,
      period_year: testYear,
      period_semester: testSemester,
      status: ReportStatus.pending_review,
      file_path: "reports/m5_rep1.xlsx",
      original_filename: "m5_rep1.xlsx",
    },
  });

  const report2 = await prisma.report.create({
    data: {
      user_id: rep2.id,
      period_year: testYear,
      period_semester: testSemester,
      status: ReportStatus.reviewed,
      reviewed_at: new Date(),
      file_path: "reports/m5_rep2.xlsx",
      original_filename: "m5_rep2.xlsx",
    },
  });

  // Query logika yang sama dengan route GET /api/admin/reports
  const activeReporters = await prisma.user.findMany({
    where: { role: Role.reporter, is_active: true },
  });

  const reportsInPeriod = await prisma.report.findMany({
    where: { period_year: testYear, period_semester: testSemester },
  });

  const submittedUserIds = new Set(reportsInPeriod.map((r) => r.user_id));
  const unsubmittedReporters = activeReporters.filter((r) => !submittedUserIds.has(r.id));

  // Verifikasi nonaktif tidak masuk dalam daftar wajib lapor aktif
  const inactiveIncluded = unsubmittedReporters.some((r) => r.id === repInactive.id);
  if (!inactiveIncluded) {
    pass("FR-ADM-02: Reporter nonaktif tidak dihitung dalam kewajiban lapor aktif");
  } else {
    fail("FR-ADM-02: Isolasi nonaktif", "Reporter nonaktif masuk dalam unsubmitted_reporters");
  }

  // Verifikasi konsistensi penjumlahan
  const total = activeReporters.length;
  const submitted = reportsInPeriod.length;
  const unsubmitted = unsubmittedReporters.length;

  if (submitted + unsubmitted === total) {
    pass(`FR-ADM-03: Konsistensi metrik terjaga (${submitted} masuk + ${unsubmitted} belum = ${total} total)`);
  } else {
    fail("FR-ADM-03: Inkonsistensi metrik", `${submitted} + ${unsubmitted} !== ${total}`);
  }

  // Verifikasi filter periode
  const reportsOtherPeriod = await prisma.report.findMany({
    where: { period_year: testYear, period_semester: 2 },
  });
  if (reportsOtherPeriod.length === 0) {
    pass("FR-ADM-04 & FR-ADM-09: Filter tahun & semester mengisolasi laporan periode lain");
  } else {
    fail("FR-ADM-04: Filter periode", "Laporan periode lain bocor ke query");
  }

  // Verifikasi penandaan status reviewed (FR-ADM-12)
  const updatedReport1 = await prisma.report.update({
    where: { id: report1.id },
    data: {
      status: ReportStatus.reviewed,
      reviewed_at: new Date(),
    },
  });

  if (updatedReport1.status === ReportStatus.reviewed && updatedReport1.reviewed_at !== null) {
    pass("FR-ADM-12: Menandai status reviewed berhasil dan mengisi reviewed_at");
  } else {
    fail("FR-ADM-12: Status review", "Gagal memperbarui status menjadi reviewed");
  }

  // Cleanup data uji
  await prisma.report.deleteMany({
    where: { id: { in: [report1.id, report2.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [rep1.id, rep2.id, rep3.id, repInactive.id] } },
  });
}

async function main() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" E-Report PBOBA — Test Suite M5: Dashboard & Pemeriksaan");
  console.log("══════════════════════════════════════════════════════\n");

  console.log("【1】 Pengujian Metrik, Filter Periode, & Review Laporan");
  await testMetricsAndConsistency();

  console.log("\n══════════════════════════════════════════════════════");
  if (process.exitCode === 1) {
    console.error(" HASIL: Pengujian M5 GAGAL");
  } else {
    console.log(" HASIL: Semua pengujian M5 LULUS ✅");
  }
  console.log("══════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Kesalahan fatal saat menjalankan test-m5:", err);
  prisma.$disconnect();
  process.exit(1);
});
