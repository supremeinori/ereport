import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Helper untuk membuat objek Date UTC murni tanpa pergeseran zona waktu
 */
function createUtcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));
}

async function main() {
  console.log("==========================================");
  console.log(" MEMULAI SEEDING PENGGUNA E-REPORT PBOBA  ");
  console.log("==========================================");

  // Kata sandi awal default (BCrypt salt rounds = 12)
  const initialPassword = process.env.SEED_DEFAULT_PASSWORD || "12345678";
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  // 1. Akun Administrator Utama
  const adminAccount = {
    identifier: "admin",
    name: "Administrator Utama PBOBA",
    email: "admin@pboba-sumbar.go.id",
    role: Role.admin,
    address: "Dinas Kesehatan Provinsi Sumatera Barat, Jl. Perintis Kemerdekaan No. 67, Padang",
    license_number: null as string | null,
    license_date: null as Date | null,
    pic_name: "Admin Dinkes Sumbar",
    pic_phone: "0751-21345",
    description: "Akun administrator sistem utama untuk verifikasi laporan dan pengelolaan master PBOT.",
  };

  // 2. Tujuh Akun Reporter PBOT Resmi
  const reporterAccounts = [
    {
      identifier: "pt1",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA CABANG KOTA SOLOK",
      email: null as string | null,
      address: "Jl. Batu Laweh RT 002 RW 003, Desa/Kel Nan Balimo, Kec Tanjung Harapan, Kota Solok, Provinsi Sumatera Barat",
      license_number: "81202142010050010",
      license_date: createUtcDate(2024, 9, 21), // 21 Oktober 2024
      pic_name: "YS. Vifti Yulia Sari",
      pic_phone: "082285207361",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Cabang Kota Solok.",
    },
    {
      identifier: "pt2",
      name: "PT PADANG DISTRIBUSINDO RAYA CABANG KABUPATEN SOLOK SELATAN",
      email: null as string | null,
      address: "Jorong Timbulun, Desa/Kel Lubuk Gadang Kec Sangir, Kab Solok Selatan Provinsi Sumatera Barat",
      license_number: "81203130719950002",
      license_date: createUtcDate(2024, 9, 30), // 30 Oktober 2024
      pic_name: "Lupia Rahmadani, S.Farm",
      pic_phone: "081378911852",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Cabang Solok Selatan.",
    },
    {
      identifier: "pt3",
      name: "PT PUTRA SUMBAR MANDIRI",
      email: null as string | null,
      address: "Jl. Bypass (Baru) KM 17 Kelurahan Koto Panjang Ikua Koto Kecamatan Koto Tangah, Padang, Sumatera Barat",
      license_number: "02620111001970001",
      license_date: createUtcDate(2024, 11, 28), // 28 Desember 2024
      pic_name: "Aprilia Alvioliza",
      pic_phone: "082172055504",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Kota Padang.",
    },
    {
      identifier: "pt4",
      name: "PT PADANG DISTRIBUSINDO RAYA CABANG KOTA PADANG",
      email: null as string | null,
      address: "Jl. Raya Bypass Km 9 No.20, Desa/Kel. Pegambiran Ampalu Nan XX, Kec. Lubuk Begalung, Kota Padang, Provinsi Sumatera Barat",
      license_number: "81203130719950009",
      license_date: createUtcDate(2024, 11, 31), // 31 Desember 2024
      pic_name: "Widuri",
      pic_phone: "08128046954",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Cabang Kota Padang.",
    },
    {
      identifier: "pt5",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA CABANG AGAM",
      email: null as string | null,
      address: "Jalan Syeh Nurdin Surau Usang Kt Malintang, Kec Tilatang Kamang Kab Agam, Sumatera Barat",
      license_number: "81202142010050009",
      license_date: createUtcDate(2024, 11, 4), // 4 Desember 2024
      pic_name: "FELI",
      pic_phone: "085376145969",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Cabang Kab. Agam.",
    },
    {
      identifier: "pt6",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA",
      email: null as string | null,
      address: "Jl. Tampuniak Jorong IV Koto Barat, Desa/Kel. Kinali, Kec. Kinali, Kab Pasaman Barat, Provinsi Sumatera Barat",
      license_number: "81202142010050011",
      license_date: createUtcDate(2024, 11, 31), // 31 Desember 2024
      pic_name: "Dian Lestari",
      pic_phone: "082264743990",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Kab. Pasaman Barat.",
    },
    {
      identifier: "pt7",
      name: "PT SUJO SYMPHONY INDONESIA",
      email: null as string | null,
      address: "Jl. Kapalo Koto dalam No.58 Desa/Kelurahan Kapalo Koto, Kecamatan Pauh, Kota Padang Provinsi Sumatera Barat",
      license_number: "15102400455150002",
      license_date: createUtcDate(2025, 3, 28), // 28 April 2025
      pic_name: "apt. Annisa Latifah, S.Farm",
      pic_phone: "08972672105",
      role: Role.reporter,
      description: "Entitas Pedagang Besar Obat Tradisional (PBOT) Kota Padang.",
    },
  ];

  const allAccounts = [adminAccount, ...reporterAccounts];

  for (const account of allAccounts) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { identifier: account.identifier },
          ...(account.email ? [{ email: account.email }] : []),
        ],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          identifier: account.identifier,
          name: account.name,
          email: account.email ?? existing.email,
          role: account.role,
          address: account.address,
          license_number: account.license_number,
          license_date: account.license_date,
          pic_name: account.pic_name,
          pic_phone: account.pic_phone,
          description: account.description,
          password_hash: passwordHash,
          is_active: true,
        },
      });

      console.log(`[PEMBARUAN] Akun ${account.identifier} (${account.name}) berhasil diperbarui.`);
    } else {
      await prisma.user.create({
        data: {
          identifier: account.identifier,
          name: account.name,
          email: account.email,
          role: account.role,
          address: account.address,
          license_number: account.license_number,
          license_date: account.license_date,
          pic_name: account.pic_name,
          pic_phone: account.pic_phone,
          description: account.description,
          password_hash: passwordHash,
          is_active: true,
        },
      });

      console.log(`[BUAT BARU] Akun ${account.identifier} (${account.name}) berhasil dibuat.`);
    }

    console.log(`   Identifier : ${account.identifier}`);
    console.log(`   Role       : ${account.role}`);
    console.log(`   Nomor Izin : ${account.license_number ?? "-"}`);
    console.log(`   Tgl Izin   : ${account.license_date ? account.license_date.toISOString().slice(0, 10) : "-"}`);
    console.log(`   PIC        : ${account.pic_name ?? "-"} (${account.pic_phone ?? "-"})`);
  }

  // 3. Bersihkan akun percobaan lama jika masih ada
  await prisma.user.deleteMany({
    where: {
      identifier: { in: ["12312"] },
    },
  });

  // 4. Generate template Excel resmi
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

    const publicDir = path.join(process.cwd(), "public", "templates");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(publicDir, OFFICIAL_TEMPLATE_FILENAME),
      templateBuffer
    );

    console.log("Template berhasil disimpan secara lokal.");

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
