/**
 * test-all.ts — Pengujian Menyeluruh Prototipe E-Report PBOBA (M8)
 * Menjalankan matriks pengujian TST-01 hingga TST-12 secara komprehensif.
 */

import { execSync } from "child_process";

interface TestStep {
  id: string;
  module: string;
  name: string;
  command: string;
}

const tests: TestStep[] = [
  { id: "M1", module: "Autentikasi & Keamanan", name: "TST-01, TST-02, TST-04, TST-12, SEC-12", command: "npm.cmd run test:m1" },
  { id: "M2", module: "Kelola Akun Reporter", name: "FR-ADM-05/06/07/08, TST-06, TST-02", command: "npm.cmd run test:m2" },
  { id: "M3", module: "Pelaporan & Validasi File", name: "TST-08, TST-09, FILE-01-06, BKP-01", command: "npm.cmd run test:m3" },
  { id: "M4", module: "Unduh Aman & Template", name: "TST-03, TST-14, FILE-07, FR-ADM-15", command: "npm.cmd run test:m4" },
  { id: "M5", module: "Dashboard & Review", name: "FR-ADM-02/03/04/09/10/12, TST-11", command: "npm.cmd run test:m5" },
  { id: "M6", module: "Layanan Tanya Jawab", name: "FR-REP-09/10, FR-ADM-13, NFR-06, SEC-07", command: "npm.cmd run test:m6" },
  { id: "M7", module: "Cadangan Google Drive", name: "BKP-01/04, TST-10, FR-ADM-14, TST-12", command: "npm.cmd run test:m7" },
];

console.log("\n==================================================================");
console.log("    E-REPORT PBOBA SUMATERA BARAT — SUITE PENGUJIAN MENYELURUH (M8)");
console.log("==================================================================\n");

const results: { id: string; module: string; name: string; status: "LULUS" | "GAGAL"; durationMs: number }[] = [];

let hasFailure = false;

for (const t of tests) {
  process.stdout.write(`⏳ Menjalankan [${t.id}] ${t.module}... `);
  const start = Date.now();
  try {
    execSync(t.command, { stdio: "pipe", env: process.env });
    const duration = Date.now() - start;
    results.push({ id: t.id, module: t.module, name: t.name, status: "LULUS", durationMs: duration });
    console.log(`✅ LULUS (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    hasFailure = true;
    results.push({ id: t.id, module: t.module, name: t.name, status: "GAGAL", durationMs: duration });
    console.log(`❌ GAGAL (${duration}ms)`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

console.log("\n==================================================================");
console.log("                  MATRIKS HASIL PENGUJIAN AKHIR                   ");
console.log("==================================================================");
console.log("| Modul | Cakupan Kebutuhan / Uji             | Status | Durasi   |");
console.log("|-------|-------------------------------------|--------|----------|");
for (const r of results) {
  const padMod = r.id.padEnd(5);
  const padName = r.name.padEnd(35);
  const padStatus = r.status.padEnd(6);
  const padDur = `${r.durationMs}ms`.padStart(8);
  console.log(`| ${padMod} | ${padName} | ${padStatus} | ${padDur} |`);
}
console.log("==================================================================");

if (hasFailure) {
  console.error("\n❌ Terdapat modul yang tidak lulus pengujian. Harap periksa rincian di atas.\n");
  process.exit(1);
} else {
  console.log("\n🎉 SELURUH 7 MODUL PENGUJIAN (M1 s/d M7) BERHASIL LULUS 100%!\n");
}
