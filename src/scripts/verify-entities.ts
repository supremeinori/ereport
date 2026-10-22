import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

async function verify() {
  console.log("==========================================");
  console.log(" VERIFIKASI AKUN ENTITAS DAN PROFIL PBOT  ");
  console.log("==========================================\n");

  const expectedAccounts = [
    {
      identifier: "pt1",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA CABANG KOTA SOLOK",
      license_number: "81202142010050010",
      license_date_str: "2024-10-21",
      pic_name: "YS. Vifti Yulia Sari",
      pic_phone: "082285207361",
    },
    {
      identifier: "pt2",
      name: "PT PADANG DISTRIBUSINDO RAYA CABANG KABUPATEN SOLOK SELATAN",
      license_number: "81203130719950002",
      license_date_str: "2024-10-30",
      pic_name: "Lupia Rahmadani, S.Farm",
      pic_phone: "081378911852",
    },
    {
      identifier: "pt3",
      name: "PT PUTRA SUMBAR MANDIRI",
      license_number: "02620111001970001",
      license_date_str: "2024-12-28",
      pic_name: "Aprilia Alvioliza",
      pic_phone: "082172055504",
    },
    {
      identifier: "pt4",
      name: "PT PADANG DISTRIBUSINDO RAYA CABANG KOTA PADANG",
      license_number: "81203130719950009",
      license_date_str: "2024-12-31",
      pic_name: "Widuri",
      pic_phone: "08128046954",
    },
    {
      identifier: "pt5",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA CABANG AGAM",
      license_number: "81202142010050009",
      license_date_str: "2024-12-04",
      pic_name: "FELI",
      pic_phone: "085376145969",
    },
    {
      identifier: "pt6",
      name: "PT BUKITTINGGI MANDIRI SEJAHTERA",
      license_number: "81202142010050011",
      license_date_str: "2024-12-31",
      pic_name: "Dian Lestari",
      pic_phone: "082264743990",
    },
    {
      identifier: "pt7",
      name: "PT SUJO SYMPHONY INDONESIA",
      license_number: "15102400455150002",
      license_date_str: "2025-04-28",
      pic_name: "apt. Annisa Latifah, S.Farm",
      pic_phone: "08972672105",
    },
  ];

  let hasError = false;

  for (const exp of expectedAccounts) {
    const user = await prisma.user.findUnique({
      where: { identifier: exp.identifier },
    });

    if (!user) {
      console.error(`[GAGAL] Akun ${exp.identifier} tidak ditemukan di database.`);
      hasError = true;
      continue;
    }

    if (user.role !== Role.reporter) {
      console.error(`[GAGAL] Akun ${exp.identifier} bukan role reporter (aktual: ${user.role}).`);
      hasError = true;
    }

    if (user.name !== exp.name) {
      console.error(`[GAGAL] Nama ${exp.identifier} tidak cocok: '${user.name}' vs '${exp.name}'.`);
      hasError = true;
    }

    if (user.license_number !== exp.license_number) {
      console.error(`[GAGAL] Nomor izin ${exp.identifier} tidak cocok: '${user.license_number}' vs '${exp.license_number}'.`);
      hasError = true;
    }

    const actualDateStr = user.license_date ? user.license_date.toISOString().slice(0, 10) : null;
    if (actualDateStr !== exp.license_date_str) {
      console.error(`[GAGAL] Tanggal izin ${exp.identifier} tidak cocok: '${actualDateStr}' vs '${exp.license_date_str}'.`);
      hasError = true;
    }

    if (user.pic_name !== exp.pic_name) {
      console.error(`[GAGAL] Nama PIC ${exp.identifier} tidak cocok: '${user.pic_name}' vs '${exp.pic_name}'.`);
      hasError = true;
    }

    if (user.pic_phone !== exp.pic_phone) {
      console.error(`[GAGAL] HP PIC ${exp.identifier} tidak cocok: '${user.pic_phone}' vs '${exp.pic_phone}'.`);
      hasError = true;
    }

    if (!user.is_active) {
      console.error(`[GAGAL] Akun ${exp.identifier} tidak aktif.`);
      hasError = true;
    }

    if (!user.password_hash.startsWith("$2a$") && !user.password_hash.startsWith("$2b$")) {
      console.error(`[GAGAL] Akun ${exp.identifier} tidak menggunakan hash bcrypt yang valid.`);
      hasError = true;
    }

    console.log(`[LULUS] ${exp.identifier}: ${user.name}`);
    console.log(`        No. Izin : ${user.license_number}`);
    console.log(`        Tgl Izin : ${actualDateStr}`);
    console.log(`        PIC      : ${user.pic_name} (${user.pic_phone})`);
    console.log(`        Alamat   : ${user.address}`);
    console.log(`        Status   : ${user.is_active ? "Aktif" : "Nonaktif"}\n`);
  }

  // Cek akun admin
  const admin = await prisma.user.findUnique({
    where: { identifier: "admin" },
  });

  if (!admin || admin.role !== Role.admin) {
    console.error("[GAGAL] Akun admin tidak ditemukan atau bukan role admin.");
    hasError = true;
  } else {
    console.log(`[LULUS] Admin terverifikasi: ${admin.identifier} (${admin.name}) - ${admin.email}\n`);
  }

  if (hasError) {
    console.error("VERIFIKASI GAGAL! Beberapa field tidak sesuai.");
    process.exit(1);
  } else {
    console.log("SEMUA 7 AKUN PBOT DAN PROFIL BERHASIL DIVERIFIKASI DENGAN LENGKAP!");
  }
}

verify()
  .catch((e) => {
    console.error("Verification error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
