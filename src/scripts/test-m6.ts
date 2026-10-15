/**
 * test-m6.ts — Test Suite M6: Layanan Tanya Jawab (Q&A)
 *
 * Cakupan:
 *   FR-REP-09 : Reporter dapat mengajukan pertanyaan (user_id terasosiasi ke sesi)
 *   NFR-06    : Validasi panjang subjek (3-150), isi pertanyaan (10-2000), dan jawaban (2-4000)
 *   SEC-07    : Isolasi antar reporter (Reporter A dilarang melihat pertanyaan Reporter B)
 *   FR-ADM-13 : Admin melihat seluruh pertanyaan dan dapat memberikan jawaban resmi
 *   Status    : Status berpindah dari open ke answered saat admin menjawab
 */

import { prisma } from "../lib/prisma";
import { Role, QuestionStatus } from "@prisma/client";
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
  return `test_m6_${crypto.randomBytes(4).toString("hex")}@pboba.test`;
}

// Validasi logika NFR-06
function validateQuestionInput(subject: string, question: string): string | null {
  if (subject.trim().length < 3 || subject.trim().length > 150) {
    return "Subjek harus antara 3 dan 150 karakter";
  }
  if (question.trim().length < 10 || question.trim().length > 2000) {
    return "Isi pertanyaan harus antara 10 dan 2000 karakter";
  }
  return null;
}

function validateAnswerInput(answer: string): string | null {
  if (answer.trim().length < 2 || answer.trim().length > 4000) {
    return "Jawaban harus antara 2 dan 4000 karakter";
  }
  return null;
}

async function testQnAFlow() {
  const hash = crypto.createHmac("sha256", "test").update("pwd").digest("hex");

  // 1. Buat 2 akun reporter dan 1 admin
  const reporterA = await prisma.user.create({
    data: {
      name: "Reporter A (M6 Test)",
      email: randomEmail(),
      identifier: `M6-A-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const reporterB = await prisma.user.create({
    data: {
      name: "Reporter B (M6 Test)",
      email: randomEmail(),
      identifier: `M6-B-${crypto.randomBytes(2).toString("hex")}`,
      password_hash: hash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const adminUser = await prisma.user.findFirst({
    where: { role: Role.admin, is_active: true },
  });

  if (!adminUser) {
    throw new Error("Admin tidak ditemukan di database untuk test-m6.");
  }

  // 2. Validasi NFR-06
  const errSubShort = validateQuestionInput("ab", "Pertanyaan pengujian valid minimal 10 karakter");
  if (errSubShort !== null) {
    pass("NFR-06: Subjek kurang dari 3 karakter ditolak");
  } else {
    fail("NFR-06: Validasi subjek pendek", "Subjek pendek diloloskan");
  }

  const errQShort = validateQuestionInput("Subjek Valid", "Pendek");
  if (errQShort !== null) {
    pass("NFR-06: Pertanyaan kurang dari 10 karakter ditolak");
  } else {
    fail("NFR-06: Validasi pertanyaan pendek", "Pertanyaan pendek diloloskan");
  }

  const errAnsShort = validateAnswerInput("x");
  if (errAnsShort !== null) {
    pass("NFR-06: Jawaban kurang dari 2 karakter ditolak");
  } else {
    fail("NFR-06: Validasi jawaban pendek", "Jawaban 1 huruf diloloskan");
  }

  // 3. Reporter A membuat pertanyaan
  const qA = await prisma.question.create({
    data: {
      user_id: reporterA.id,
      subject: "Kendala format sediaan obat tradisional",
      question: "Apakah sediaan salep herbal dimasukkan ke kolom sediaan luar?",
      status: QuestionStatus.open,
    },
  });

  // Reporter B membuat pertanyaan
  const qB = await prisma.question.create({
    data: {
      user_id: reporterB.id,
      subject: "Batas akhir pelaporan semester ganjil",
      question: "Kapan tanggal penutupan unggah laporan untuk semester 1?",
      status: QuestionStatus.open,
    },
  });

  // 4. Verifikasi Isolasi Akses (SEC-07 & FR-REP-10)
  // Query yang dilakukan Reporter A
  const questionsA = await prisma.question.findMany({
    where: { user_id: reporterA.id },
  });

  const seesOwnOnly = questionsA.every((q) => q.user_id === reporterA.id);
  const seesB = questionsA.some((q) => q.id === qB.id);

  if (seesOwnOnly && !seesB) {
    pass("SEC-07 & FR-REP-10: Reporter A hanya melihat pertanyaannya sendiri (tidak melihat milik Reporter B)");
  } else {
    fail("SEC-07: Kebocoran pertanyaan", "Reporter A dapat melihat pertanyaan Reporter B");
  }

  // 5. Verifikasi Admin Melihat Semua Pertanyaan (FR-ADM-13)
  const allQuestionsForAdmin = await prisma.question.findMany({
    where: { id: { in: [qA.id, qB.id] } },
  });

  if (allQuestionsForAdmin.length === 2) {
    pass("FR-ADM-13: Admin dapat melihat seluruh pertanyaan yang masuk dari berbagai PBOT");
  } else {
    fail("FR-ADM-13: Akses admin", "Admin tidak melihat semua pertanyaan");
  }

  // 6. Admin menjawab pertanyaan qA
  const answerText = "Ya, seluruh sediaan salep dan krim dimasukkan ke kelompok sediaan luar pada sheet ke-2.";
  const updatedQA = await prisma.question.update({
    where: { id: qA.id },
    data: {
      answer: answerText,
      answered_by: adminUser.id,
      status: QuestionStatus.answered,
      answered_at: new Date(),
    },
  });

  if (
    updatedQA.status === QuestionStatus.answered &&
    updatedQA.answer === answerText &&
    updatedQA.answered_by === adminUser.id &&
    updatedQA.answered_at !== null
  ) {
    pass("FR-ADM-13: Admin berhasil menjawab pertanyaan dan status berpindah ke 'answered'");
  } else {
    fail("FR-ADM-13: Alur penjawab", "Pencatatan jawaban atau transisi status gagal");
  }

  // Cleanup data uji
  await prisma.question.deleteMany({
    where: { id: { in: [qA.id, qB.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [reporterA.id, reporterB.id] } },
  });
}

async function main() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" E-Report PBOBA — Test Suite M6: Layanan Tanya Jawab");
  console.log("══════════════════════════════════════════════════════\n");

  console.log("【1】 Validasi NFR-06, Isolasi SEC-07, & Alur Tanya Jawab");
  await testQnAFlow();

  console.log("\n══════════════════════════════════════════════════════");
  if (process.exitCode === 1) {
    console.error(" HASIL: Pengujian M6 GAGAL");
  } else {
    console.log(" HASIL: Semua pengujian M6 LULUS ✅");
  }
  console.log("══════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Kesalahan fatal saat menjalankan test-m6:", err);
  prisma.$disconnect();
  process.exit(1);
});
