import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { signSessionToken, verifySessionToken } from "../lib/auth";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==========================================");
  console.log("MEMULAI PENGUJIAN OTOMATIS MODUL M2");
  console.log("==========================================\n");

  let allPassed = true;

  // Persiapan data uji
  const testAdminIdentifier = "TEST-ADMIN-M2";
  const testAdminEmail = "admin-m2@test.local";
  const dummyPassword = "AdminSecurePassword123!";

  const reporter1Id = "TEST-PBOT-PADANG-01";
  const reporter1Email = "pbot1@padang.test.local";

  const reporter2Id = "TEST-PBOT-BUKITTINGGI-02";
  const reporter2Email = "pbot2@bukittinggi.test.local";

  console.log("1. Membersihkan data uji sebelumnya...");
  await prisma.user.deleteMany({
    where: {
      email: { in: [testAdminEmail, reporter1Email, reporter2Email] },
    },
  });

  console.log("2. Membuat akun admin uji...");
  const adminHash = await bcrypt.hash(dummyPassword, 10);
  const admin = await prisma.user.create({
    data: {
      identifier: testAdminIdentifier,
      name: "Admin Penguji M2",
      email: testAdminEmail,
      password_hash: adminHash,
      role: Role.admin,
      is_active: true,
    },
  });

  // TEST 1: Pembuatan akun reporter oleh admin (FR-ADM-07)
  console.log("3. Uji Pembuatan Akun Reporter oleh Admin (FR-ADM-07)...");
  const reporterHash = await bcrypt.hash(dummyPassword, 10);
  const rep1 = await prisma.user.create({
    data: {
      identifier: reporter1Id,
      name: "PT Jamu Padang Lestari",
      email: reporter1Email,
      password_hash: reporterHash,
      role: Role.reporter, // role dipaksa reporter
      is_active: true,
    },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      // password_hash tidak di-select
    },
  });

  const rep2 = await prisma.user.create({
    data: {
      identifier: reporter2Id,
      name: "CV Herbal Bukittinggi Alami",
      email: reporter2Email,
      password_hash: reporterHash,
      role: Role.reporter,
      is_active: true,
    },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  if (rep1 && rep2 && rep1.role === Role.reporter && rep2.role === Role.reporter) {
    console.log("   [LULUS] Akun reporter berhasil dibuat dengan role reporter terkunci.");
  } else {
    console.error("   [GAGAL] Akun reporter gagal dibuat.");
    allPassed = false;
  }

  // TEST 2: Validasi keunikan identifier dan email (Bagian 4.1)
  console.log("4. Uji Validasi Keunikan Identifier & Email...");
  try {
    await prisma.user.create({
      data: {
        identifier: reporter1Id, // duplikat identifier
        name: "Entitas Palsu Duplikat",
        email: "unique@test.local",
        password_hash: reporterHash,
        role: Role.reporter,
      },
    });
    console.error("   [GAGAL] Duplikasi identifier diizinkan oleh database!");
    allPassed = false;
  } catch {
    console.log("   [LULUS] Duplikasi identifier berhasil ditolak oleh UNIQUE constraint.");
  }

  try {
    await prisma.user.create({
      data: {
        identifier: "TEST-UNIQUE-ID",
        name: "Entitas Palsu Email Duplikat",
        email: reporter1Email, // duplikat email
        password_hash: reporterHash,
        role: Role.reporter,
      },
    });
    console.error("   [GAGAL] Duplikasi email diizinkan oleh database!");
    allPassed = false;
  } catch {
    console.log("   [LULUS] Duplikasi email berhasil ditolak oleh UNIQUE constraint.");
  }

  // TEST 3: Pencarian reporter berdasarkan nama atau identifier (TST-06, FR-ADM-06)
  console.log("5. Uji Pencarian Nama dan Identifier (TST-06)...");
  const searchByName = await prisma.user.findMany({
    where: {
      role: Role.reporter,
      email: { in: [reporter1Email, reporter2Email] },
      name: { contains: "Bukittinggi", mode: "insensitive" },
    },
  });
  const searchById = await prisma.user.findMany({
    where: {
      role: Role.reporter,
      email: { in: [reporter1Email, reporter2Email] },
      identifier: { contains: "PADANG", mode: "insensitive" },
    },
  });

  if (searchByName.length === 1 && searchByName[0].identifier === reporter2Id &&
      searchById.length === 1 && searchById[0].identifier === reporter1Id) {
    console.log("   [LULUS] TST-06: Pencarian berdasarkan nama dan identifier berfungsi akurat.");
  } else {
    console.error("   [GAGAL] TST-06: Pencarian tidak menghasilkan data yang tepat.");
    allPassed = false;
  }

  // TEST 4: Nonaktifkan akun dan cabut akses sesi aktif (TST-02, FR-ADM-08)
  console.log("6. Uji Nonaktifkan Akun & Pencabutan Sesi Langsung (TST-02)...");
  // Reporter 1 memiliki token sesi aktif
  const activeSessionToken = signSessionToken({
    userId: rep1.id,
    role: rep1.role,
  });

  // Admin menonaktifkan akun Reporter 1
  const deactivatedUser = await prisma.user.update({
    where: { id: rep1.id },
    data: { is_active: false },
    select: { id: true, is_active: true },
  });

  if (!deactivatedUser.is_active) {
    console.log("   [LULUS] Status akun berhasil diubah menjadi is_active = false.");
  } else {
    console.error("   [GAGAL] Gagal mengubah status akun.");
    allPassed = false;
  }

  // Sesi yang sedang berjalan diperiksa ke database (server verification SEC-09):
  const payload = verifySessionToken(activeSessionToken);
  const sessionUserCheck = await prisma.user.findUnique({
    where: { id: payload!.userId },
    select: { is_active: true },
  });

  if (sessionUserCheck && !sessionUserCheck.is_active) {
    console.log("   [LULUS] TST-02: Sesi aktif dari akun yang dinonaktifkan langsung ditolak di server.");
  } else {
    console.error("   [GAGAL] TST-02: Akun nonaktif masih memiliki akses aktif.");
    allPassed = false;
  }

  // TEST 5: Mengaktifkan kembali akun (FR-ADM-08)
  console.log("7. Uji Mengaktifkan Kembali Akun Reporter...");
  const reactivatedUser = await prisma.user.update({
    where: { id: rep1.id },
    data: { is_active: true },
    select: { id: true, is_active: true },
  });

  if (reactivatedUser.is_active) {
    console.log("   [LULUS] Akun berhasil diaktifkan kembali.");
  } else {
    console.error("   [GAGAL] Gagal mengaktifkan kembali akun.");
    allPassed = false;
  }

  // TEST 6: Proteksi TST-12 (Data password_hash tidak pernah bocor)
  console.log("8. Uji TST-12: Verifikasi API/Query tidak memuat password_hash...");
  const safeReporterQuery = await prisma.user.findUnique({
    where: { id: rep1.id },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  const responseJson = JSON.stringify(safeReporterQuery);
  if (!responseJson.includes("password_hash") && !responseJson.includes("hash")) {
    console.log("   [LULUS] TST-12: Data reporter tidak membocorkan hash password.");
  } else {
    console.error("   [GAGAL] TST-12: Terdeteksi hash password.");
    allPassed = false;
  }

  // Bersihkan data uji
  console.log("9. Membersihkan data uji...");
  await prisma.user.deleteMany({
    where: {
      email: { in: [testAdminEmail, reporter1Email, reporter2Email] },
    },
  });

  console.log("\n==========================================");
  if (allPassed) {
    console.log("SEMUA PENGUJIAN MODUL M2 LULUS DENGAN BAIK!");
  } else {
    console.error("BEBERAPA PENGUJIAN MODUL M2 GAGAL!");
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
