import fs from "fs";
import path from "path";
import { generateOfficialTemplateBuffer, OFFICIAL_TEMPLATE_FILENAME } from "../lib/excel-template";

async function main() {
  console.log("Membuat berkas template resmi Excel E-Report PBOBA...");
  const buffer = await generateOfficialTemplateBuffer();

  const outDir = path.join(process.cwd(), "public", "templates");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, OFFICIAL_TEMPLATE_FILENAME);
  fs.writeFileSync(outPath, buffer);
  console.log(`[SUKSES] Template resmi berhasil disimpan di: ${outPath} (${buffer.length} bytes)`);

  // Simpan juga salinan di folder templates/ root jika diperlukan
  const rootTemplateDir = path.join(process.cwd(), "templates");
  if (!fs.existsSync(rootTemplateDir)) {
    fs.mkdirSync(rootTemplateDir, { recursive: true });
  }
  fs.writeFileSync(path.join(rootTemplateDir, "template_laporan_pboba.xlsx"), buffer);
  console.log(`[SUKSES] Salinan template disimpan di templates/template_laporan_pboba.xlsx`);
}

main().catch((err) => {
  console.error("Gagal membuat template:", err);
  process.exit(1);
});
