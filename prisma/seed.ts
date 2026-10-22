
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

async function main() {
  console.log("==========================================");
  console.log(" MEMULAI SEEDING PENGGUNA E-REPORT PBOBA  ");
  console.log("==========================================");

  const sharedPassword = "12345678";
  const passwordHash = await bcrypt.hash(sharedPassword, 12);

  // 1. Akun Admin dan Reporter
  const accounts = [
    {
      identifier: "admin",
      name: "Administrator Utama PBOBA",
      email: "admin@pboba-sumbar.go.id",
      role: Role.admin,
    },
    {
      identifier: "pt1",
      name: "PT Satu Herbal Tradisional (PT 1)",
      email: "pt1@pboba.id",
      role: Role.reporter,
    },
  ];

  for (const account of accounts) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { identifier: account.identifier },
          { email: account.email },
        ],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          ...account,
          password_hash: passwordHash,
          is_active: true,
        },
      });

      console.log(`Akun ${account.identifier} berhasil diperbarui.`);
    } else {
      await prisma.user.create({
        data: {
          ...account,
          password_hash: passwordHash,
          is_active: true,
        },
      });

      console.log(`Akun ${account.identifier} berhasil dibuat.`);
    }

    console.log(`   Username: ${account.identifier}`);
    console.log(`   Password: ${sharedPassword}`);
    console.log(`   Role    : ${account.role}`);
  }

  // 2. Hapus akun percobaan jika masih ada
  await prisma.user.deleteMany({
    where: {
      identifier: { in: ["12312"] },
    },
  });

  console.log("Pembersihan akun percobaan selesai.");

  // 3. Generate template Excel resmi
  console.log("\nMenyiapkan template Excel resmi...");

  try {
    const fs = await import("fs");
    const path = await import("path");

    const {
      generateOfficialTemplateBuffer,
      OFFICIAL_TEMPLATE_FILENAME,
    } = await import("../src/lib/excel-template");

    const { getStorageProvider } = await import("../src/lib/storage");

    const templateBuffer = await generateOfficialTemplateBuffer();

    // Simpan ke public/templates
    const publicDir = path.join(
      process.cwd(),
      "public",
      "templates"
    );

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(publicDir, OFFICIAL_TEMPLATE_FILENAME),
      templateBuffer
    );

    console.log("Template berhasil disimpan secara lokal.");

    // Unggah ke storage jika tersedia
    try {
      const storage = getStorageProvider();

      await storage.uploadFile(
        "templates/template_laporan_pboba.xlsx",
        templateBuffer,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      console.log("Template berhasil diunggah ke storage.");
    } catch (error) {
      console.warn(
        "Template hanya tersedia secara lokal:",
        error instanceof Error ? error.message : error
      );
    }
  } catch (error) {
    console.warn(
      "Gagal menyiapkan template Excel:",
      error instanceof Error ? error.message : error
    );
  }

  console.log("\n==========================================");
  console.log(" SEEDING BERHASIL SELESAI                 ");
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("Seeding gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
