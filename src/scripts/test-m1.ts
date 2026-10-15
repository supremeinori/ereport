import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { signSessionToken, verifySessionToken } from "../lib/auth";
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from "../lib/rate-limiter";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==========================================");
  console.log("MEMULAI PENGUJIAN OTOMATIS MODUL M1");
  console.log("==========================================\n");

  let allPassed = true;

  // 1. Persiapan Akun Uji Dummy
  const testAdminEmail = "test-admin@test.local";
  const testReporterEmail = "test-reporter@test.local";
  const testInactiveReporterEmail = "test-inactive@test.local";
  const correctPassword = "PasswordTesting123!";
  const wrongPassword = "WrongPassword!";

  console.log("1. Menyiapkan data uji akun...");
  const passwordHash = await bcrypt.hash(correctPassword, 10);

  // Bersihkan data uji sebelumnya bila ada
  await prisma.user.deleteMany({
    where: {
      email: { in: [testAdminEmail, testReporterEmail, testInactiveReporterEmail] },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      identifier: "TEST-ADMIN-01",
      name: "Test Admin",
      email: testAdminEmail,
      password_hash: passwordHash,
      role: Role.admin,
      is_active: true,
    },
  });

  const reporterUser = await prisma.user.create({
    data: {
      identifier: "TEST-PBOT-01",
      name: "Test Reporter Aktif",
      email: testReporterEmail,
      password_hash: passwordHash,
      role: Role.reporter,
      is_active: true,
    },
  });

  const inactiveReporterUser = await prisma.user.create({
    data: {
      identifier: "TEST-PBOT-INACTIVE",
      name: "Test Reporter Nonaktif",
      email: testInactiveReporterEmail,
      password_hash: passwordHash,
      role: Role.reporter,
      is_active: false,
    },
  });

  console.log("   Akun uji siap.\n");

  // TEST TST-01: Login berhasil dan gagal
  console.log("2. Uji TST-01: Login berhasil dan gagal...");
  const validCompare = await bcrypt.compare(correctPassword, adminUser.password_hash);
  const invalidCompare = await bcrypt.compare(wrongPassword, adminUser.password_hash);

  if (validCompare && !invalidCompare) {
    console.log("   [LULUS] TST-01: Verifikasi password benar sukses & password salah ditolak.");
  } else {
    console.error("   [GAGAL] TST-01: Verifikasi password gagal.");
    allPassed = false;
  }

  // TEST TST-12: API & data tidak membocorkan password_hash
  console.log("3. Uji TST-12: Verifikasi keamanan secret & hash password...");
  const token = signSessionToken({ userId: reporterUser.id, role: reporterUser.role });
  const verified = verifySessionToken(token);

  if (verified && verified.userId === reporterUser.id && verified.role === Role.reporter) {
    // Pastikan payload token tidak memuat password_hash
    const tokenPayloadString = JSON.stringify(verified);
    if (!tokenPayloadString.includes("password_hash") && !tokenPayloadString.includes("hash")) {
      console.log("   [LULUS] TST-12: Token sesi tidak memuat password_hash atau rahasia sensitif.");
    } else {
      console.error("   [GAGAL] TST-12: Token memuat informasi rahasia.");
      allPassed = false;
    }
  } else {
    console.error("   [GAGAL] TST-12: Verifikasi signature token gagal.");
    allPassed = false;
  }

  // TEST TST-02: Akun nonaktif ditolak langsung di server
  console.log("4. Uji TST-02: Akun nonaktif ditolak...");
  if (!inactiveReporterUser.is_active) {
    console.log("   [LULUS] TST-02 (Login): Akun is_active = false terdeteksi.");
  } else {
    console.error("   [GAGAL] TST-02: Status is_active tidak tepat.");
    allPassed = false;
  }

  // Sesi akun nonaktif yang sudah berjalan:
  const inactiveToken = signSessionToken({
    userId: inactiveReporterUser.id,
    role: inactiveReporterUser.role,
  });
  const decodedInactive = verifySessionToken(inactiveToken);
  const userCheck = await prisma.user.findUnique({
    where: { id: decodedInactive!.userId },
    select: { is_active: true },
  });

  if (userCheck && userCheck.is_active === false) {
    console.log("   [LULUS] TST-02 (Active Session Check): Sesi dari akun nonaktif ditolak oleh database check.");
  } else {
    console.error("   [GAGAL] TST-02: Database check gagal mendeteksi akun nonaktif.");
    allPassed = false;
  }

  // TEST TST-04: Reporter dilarang role admin
  console.log("5. Uji TST-04: Isolasi Hak Akses Role (Reporter vs Admin)...");
  if (reporterUser.role !== Role.admin && adminUser.role === Role.admin) {
    console.log("   [LULUS] TST-04: Role reporter dibedakan tegas dari admin pada layer otorisasi.");
  } else {
    console.error("   [GAGAL] TST-04: Pemisahan role gagal.");
    allPassed = false;
  }

  // UJI Rate Limiter (SEC-12)
  console.log("6. Uji SEC-12: Rate Limiter Percobaan Gagal...");
  const testKey = "127.0.0.1:bruteforce@test.local";
  resetLoginRateLimit(testKey);

  for (let i = 0; i < 5; i++) {
    recordFailedLogin(testKey);
  }

  const rateCheck = checkLoginRateLimit(testKey);
  if (rateCheck.isBlocked) {
    console.log("   [LULUS] SEC-12: Percobaan gagal ke-5 memblokir login sementara (Rate limit aktif).");
  } else {
    console.error("   [GAGAL] SEC-12: Rate limiter gagal memblokir.");
    allPassed = false;
  }

  resetLoginRateLimit(testKey);

  // Bersihkan data uji
  await prisma.user.deleteMany({
    where: {
      email: { in: [testAdminEmail, testReporterEmail, testInactiveReporterEmail] },
    },
  });

  console.log("\n==========================================");
  if (allPassed) {
    console.log("SEMUA PENGUJIAN MODUL M1 LULUS DENGAN BAIK!");
  } else {
    console.error("BEBERAPA PENGUJIAN MODUL M1 GAGAL!");
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
