import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

async function main() {
  console.log("==========================================");
  console.log(" MEMULAI SEEDING PENGGUNA E-REPORT PBOBA  ");
  console.log("==========================================");

  const sharedPassword = "12345678";
  const passwordHash = await bcrypt.hash(sharedPassword, 12);

  // 1. Akun Admin
  // username: admin | password: 12345678
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { identifier: "admin" },
        { identifier: "ADMIN-SUMBAR-01" },
        { email: "admin@pboba-sumbar.go.id" },
      ],
    },
  });

  if (existingAdmin) {
    const updatedAdmin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        identifier: "admin",
        password_hash: passwordHash,
        name: "Administrator Utama PBOBA",
        email: "admin@pboba-sumbar.go.id",
        role: Role.admin,
        is_active: true,
      },
    });
    console.log("✅ Akun Admin berhasil diatur/diperbarui:");
    console.log(`   • Username : ${updatedAdmin.identifier}`);
    console.log(`   • Password : ${sharedPassword}`);
    console.log(`   • Role     : ${updatedAdmin.role}`);
  } else {
    const newAdmin = await prisma.user.create({
      data: {
        identifier: "admin",
        password_hash: passwordHash,
        name: "Administrator Utama PBOBA",
        email: "admin@pboba-sumbar.go.id",
        role: Role.admin,
        is_active: true,
      },
    });
    console.log("✅ Akun Admin berhasil dibuat baru:");
    console.log(`   • Username : ${newAdmin.identifier}`);
    console.log(`   • Password : ${sharedPassword}`);
    console.log(`   • Role     : ${newAdmin.role}`);
  }

  // 2. Akun Reporter
  // username: pt1 | password: 12345678
  const existingReporter = await prisma.user.findFirst({
    where: {
      OR: [
        { identifier: "pt1" },
        { email: "pt1@pboba.id" },
      ],
    },
  });

  if (existingReporter) {
    const updatedReporter = await prisma.user.update({
      where: { id: existingReporter.id },
      data: {
        identifier: "pt1",
        password_hash: passwordHash,
        name: "PT Satu Herbal Tradisional (PT 1)",
        email: "pt1@pboba.id",
        role: Role.reporter,
        is_active: true,
      },
    });
    console.log("\n✅ Akun Reporter berhasil diatur/diperbarui:");
    console.log(`   • Username : ${updatedReporter.identifier}`);
    console.log(`   • Password : ${sharedPassword}`);
    console.log(`   • Nama PT  : ${updatedReporter.name}`);
    console.log(`   • Role     : ${updatedReporter.role}`);
  } else {
    const newReporter = await prisma.user.create({
      data: {
        identifier: "pt1",
        password_hash: passwordHash,
        name: "PT Satu Herbal Tradisional (PT 1)",
        email: "pt1@pboba.id",
        role: Role.reporter,
        is_active: true,
      },
    });
    console.log("\n✅ Akun Reporter berhasil dibuat baru:");
    console.log(`   • Username : ${newReporter.identifier}`);
    console.log(`   • Password : ${sharedPassword}`);
    console.log(`   • Nama PT  : ${newReporter.name}`);
    console.log(`   • Role     : ${newReporter.role}`);
  }

  // Hapus akun percobaan acak jika ada
  await prisma.user.deleteMany({
    where: {
      identifier: { in: ["12312"] },
    },
  });

  console.log("\n==========================================");
  console.log(" SEEDING DATABASE BERHASIL SELESAI!       ");
  console.log("==========================================");
}

main()
  .catch((err) => {
    console.error("Kesalahan saat seeding:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
