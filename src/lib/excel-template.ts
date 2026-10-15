import ExcelJS from "exceljs";

export const OFFICIAL_TEMPLATE_FILENAME = "Template_Laporan_Distribusi_PBOBA.xlsx";

export interface TemplateStructureColumn {
  key: string;
  header: string;
  subHeader?: string;
  width: number;
  align?: "left" | "center" | "right";
}

export const TEMPLATE_COLUMNS_SPEC = [
  { col: "A", key: "no", title: "NO", group: null, width: 6, align: "center" },
  { col: "B", key: "nie", title: "NIE", group: null, width: 18, align: "center" },
  { col: "C", key: "nama_produk", title: "NAMA PRODUK", group: null, width: 32, align: "left" },
  { col: "D", key: "kemasan", title: "KEMASAN", group: null, width: 16, align: "left" },
  { col: "E", key: "stok_awal", title: "STOK AWAL", group: null, width: 14, align: "right" },
  // JUMLAH PEMASUKAN
  { col: "F", key: "masuk_iot", title: "IOT", group: "JUMLAH PEMASUKAN", width: 14, align: "right" },
  { col: "G", key: "masuk_lainnya", title: "Lainnya", group: "JUMLAH PEMASUKAN", width: 14, align: "right" },
  // JUMLAH PENGELUARAN
  { col: "H", key: "keluar_pedagang_eceran", title: "Pedagang eceran", group: "JUMLAH PENGELUARAN", width: 16, align: "right" },
  { col: "I", key: "keluar_rs", title: "RS", group: "JUMLAH PENGELUARAN", width: 12, align: "right" },
  { col: "J", key: "keluar_apotek", title: "Apotek", group: "JUMLAH PENGELUARAN", width: 14, align: "right" },
  { col: "K", key: "keluar_sarana_pemerintah", title: "Sarana Pemerintah", group: "JUMLAH PENGELUARAN", width: 18, align: "right" },
  { col: "L", key: "keluar_puskesmas", title: "Puskesmas", group: "JUMLAH PENGELUARAN", width: 14, align: "right" },
  { col: "M", key: "keluar_klinik", title: "Klinik", group: "JUMLAH PENGELUARAN", width: 14, align: "right" },
  { col: "N", key: "keluar_toko_obat", title: "Toko Obat", group: "JUMLAH PENGELUARAN", width: 14, align: "right" },
  { col: "O", key: "keluar_retur", title: "Retur", group: "JUMLAH PENGELUARAN", width: 12, align: "right" },
  { col: "P", key: "keluar_lainnya", title: "Lainnya", group: "JUMLAH PENGELUARAN", width: 14, align: "right" },
  // SISA STOK & HNA
  { col: "Q", key: "sisa_stok", title: "Sisa Stok", group: null, width: 14, align: "right" },
  { col: "R", key: "hna", title: "HNA", group: null, width: 16, align: "right" },
];

/**
 * Menghasilkan Buffer berkas Excel (.xlsx) resmi template pelaporan PBOBA
 * dengan header berjenjang, rumus otomatis Sisa Stok, border rapi, dan kolom penandatanganan.
 */
export async function generateOfficialTemplateBuffer(titlePeriod: string = "PELAPORAN OBAT TRADISIONAL PERIODE SEMESTER I TAHUN 2024"): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BBPOM di Padang - E-Report PBOBA";
  workbook.lastModifiedBy = "E-Report PBOBA System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Laporan Distribusi", {
    views: [{ showGridLines: true }],
  });

  // Set lebar kolom A s.d. R
  TEMPLATE_COLUMNS_SPEC.forEach((spec, index) => {
    worksheet.getColumn(index + 1).width = spec.width;
  });

  // Row 1: Judul Laporan
  const titleRow = worksheet.getRow(1);
  titleRow.height = 26;
  const titleCell = worksheet.getCell("A1");
  titleCell.value = titlePeriod.toUpperCase();
  titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  // Row 2: Spasi kosong
  worksheet.getRow(2).height = 12;

  // Row 3 & 4: Header Berjenjang
  const row3 = worksheet.getRow(3);
  const row4 = worksheet.getRow(4);
  row3.height = 24;
  row4.height = 24;

  const headerPrimaryFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F766E" }, // Dark Emerald / Teal khas farmasi / BPOM
  };

  const headerSubFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF115E59" }, // Deep Teal
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };

  // 1. Kolom Tunggal yang di-merge vertikal (Row 3 ke Row 4)
  const singleMergedCols = [
    { col: "A", title: "NO" },
    { col: "B", title: "NIE" },
    { col: "C", title: "NAMA PRODUK" },
    { col: "D", title: "KEMASAN" },
    { col: "E", title: "STOK AWAL" },
    { col: "Q", title: "Sisa Stok" },
    { col: "R", title: "HNA" },
  ];

  singleMergedCols.forEach(({ col, title }) => {
    worksheet.mergeCells(`${col}3:${col}4`);
    const cell = worksheet.getCell(`${col}3`);
    cell.value = title;
    cell.font = headerFont;
    cell.fill = headerPrimaryFill;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // 2. JUMLAH PEMASUKAN (F3:G3)
  worksheet.mergeCells("F3:G3");
  const cellPemasukan = worksheet.getCell("F3");
  cellPemasukan.value = "JUMLAH PEMASUKAN";
  cellPemasukan.font = headerFont;
  cellPemasukan.fill = headerPrimaryFill;
  cellPemasukan.alignment = { vertical: "middle", horizontal: "center" };

  // Subkolom Pemasukan (F4: IOT, G4: Lainnya)
  const cellF4 = worksheet.getCell("F4");
  cellF4.value = "IOT";
  cellF4.font = headerFont;
  cellF4.fill = headerSubFill;
  cellF4.alignment = { vertical: "middle", horizontal: "center" };

  const cellG4 = worksheet.getCell("G4");
  cellG4.value = "Lainnya";
  cellG4.font = headerFont;
  cellG4.fill = headerSubFill;
  cellG4.alignment = { vertical: "middle", horizontal: "center" };

  // 3. JUMLAH PENGELUARAN (H3:P3)
  worksheet.mergeCells("H3:P3");
  const cellPengeluaran = worksheet.getCell("H3");
  cellPengeluaran.value = "JUMLAH PENGELUARAN";
  cellPengeluaran.font = headerFont;
  cellPengeluaran.fill = headerPrimaryFill;
  cellPengeluaran.alignment = { vertical: "middle", horizontal: "center" };

  // Subkolom Pengeluaran
  const pengeluaranSubs = [
    { col: "H", title: "Pedagang eceran" },
    { col: "I", title: "RS" },
    { col: "J", title: "Apotek" },
    { col: "K", title: "Sarana Pemerintah" },
    { col: "L", title: "Puskesmas" },
    { col: "M", title: "Klinik" },
    { col: "N", title: "Toko Obat" },
    { col: "O", title: "Retur" },
    { col: "P", title: "Lainnya" },
  ];

  pengeluaranSubs.forEach(({ col, title }) => {
    const cell = worksheet.getCell(`${col}4`);
    cell.value = title;
    cell.font = headerFont;
    cell.fill = headerSubFill;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // Beri border pada seluruh sel header (Row 3 dan 4, Col 1-18)
  for (let r = 3; r <= 4; r++) {
    for (let c = 1; c <= 18; c++) {
      worksheet.getRow(r).getCell(c).border = thinBorder;
    }
  }

  // 4. Data Rows (Baris 5 s.d. 34: 30 Baris Template)
  const startDataRow = 5;
  const totalDataRows = 30;

  for (let i = 0; i < totalDataRows; i++) {
    const rowNum = startDataRow + i;
    const row = worksheet.getRow(rowNum);
    row.height = 20;

    // Nomor urut otomatis
    const noCell = row.getCell(1);
    noCell.value = i + 1;
    noCell.alignment = { vertical: "middle", horizontal: "center" };

    // Format kolom teks (B, C, D)
    row.getCell(2).alignment = { vertical: "middle", horizontal: "center" }; // NIE
    row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };   // NAMA PRODUK
    row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };   // KEMASAN

    // Format kolom angka (E s.d. P)
    for (let c = 5; c <= 16; c++) {
      const cell = row.getCell(c);
      cell.numFmt = "#,##0";
      cell.alignment = { vertical: "middle", horizontal: "right" };
    }

    // Kolom Q: Sisa Stok (Formula Otomatis: Stok Awal + (IOT + Lainnya) - SUM(Pengeluaran))
    const sisaStokCell = row.getCell(17);
    sisaStokCell.value = {
      formula: `E${rowNum}+SUM(F${rowNum}:G${rowNum})-SUM(H${rowNum}:P${rowNum})`,
      result: 0,
    };
    sisaStokCell.numFmt = "#,##0";
    sisaStokCell.font = { bold: true };
    sisaStokCell.alignment = { vertical: "middle", horizontal: "right" };

    // Kolom R: HNA (Harga Netto Apotek)
    const hnaCell = row.getCell(18);
    hnaCell.numFmt = "#,##0";
    hnaCell.alignment = { vertical: "middle", horizontal: "right" };

    // Beri border untuk setiap sel baris data
    for (let c = 1; c <= 18; c++) {
      row.getCell(c).border = thinBorder;
    }
  }

  // 5. Bagian Penandatanganan (Row 36 s.d. 42)
  const sigStartRow = startDataRow + totalDataRows + 2; // Baris 37

  const pjCell = worksheet.getCell(`B${sigStartRow}`);
  pjCell.value = "Penanggung Jawab PBOT,";
  pjCell.font = { name: "Calibri", size: 11, bold: true };

  const nameCell = worksheet.getCell(`B${sigStartRow + 5}`);
  nameCell.value = "Nama : ....................................................";
  nameCell.font = { name: "Calibri", size: 11 };

  const sipCell = worksheet.getCell(`B${sigStartRow + 6}`);
  sipCell.value = "SIPTTK / STRA : .....................................";
  sipCell.font = { name: "Calibri", size: 11 };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
