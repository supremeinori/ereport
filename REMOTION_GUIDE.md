# Panduan Integrasi Remotion — Video Demo E-Report PBOBA

Mockup HTML telah dibuat di file: [`mockup-remotion.html`](file:///c:/Users/HYPE%20AMD/Documents/My%20Project/E-report/mockup-remotion.html).

Mockup ini dirancang khusus untuk pembuatan video presentasi / showcase dengan Remotion, OBS, atau perekam layar dengan rasio standar **1920×1080 (16:9 Full HD)**.

---

## 1. Cara Menjalankan & Menggunakan Mockup Langsung di Browser

Anda dapat membuka file [`mockup-remotion.html`](file:///c:/Users/HYPE%20AMD/Documents/My%20Project/E-report/mockup-remotion.html) langsung dengan klik dua kali atau membukanya di browser:

```bash
# Atau via PowerShell di folder project:
Start-Process "mockup-remotion.html"
```

### Tombol Shortcut / Navigasi Interaktif:
- **Angka `1` s/d `5`**: Langsung melompat ke Scene 1 sampai Scene 5.
- **Panah Kanan `→` atau `Spasi`**: Pindah ke Scene berikutnya.
- **Panah Kiri `←`**: Mundur ke Scene sebelumnya.
- **Tombol `F`**: Mengaktifkan / mematikan bingkai jendela browser (Browser Chrome / Clean Canvas).
- **Auto-Play (5s)**: Mode demo otomatis berpindah scene tiap 5 detik.

---

## 2. Struktur 5 Adegan (Storyflow Video Demo)

Sesuai dokumen tata kelola `DESIGN.md` E-Report PBOBA Sumatera Barat:

1. **Scene 1 — Autentikasi & Portal Masuk**:
   - Tampilan login resmi PBOT (Pedagang Besar Obat Tradisional) & Auditor Dinkes.
   - Identitas resmi Pemprov Sumatera Barat & landasan hukum BPOM No. 25 Tahun 2021.
2. **Scene 2 — Dashboard Register PBOT**:
   - Buku register digital pelaporan semesteran.
   - Ringkasan kepatuhan, tenggat waktu 31 Juli, status berkas, dan histori pelaporan.
3. **Scene 3 — Formulir Unggah Laporan Distribusi**:
   - Area drag & drop file Excel laporan distribusi `.xlsx` dan Surat Pengantar resmi `.pdf`.
   - Validasi otomatis data transaksi & integritas file SHA-256.
4. **Scene 4 — Panel Verifikasi Auditor Dinkes**:
   - Tampilan khusus pemeriksa Dinas Kesehatan (Auditor View).
   - Review data mutasi batch obat bahan alam, checklist persyaratan, dan catatan resmi.
5. **Scene 5 — Bukti Tanda Terima Elektronik (BTE)**:
   - Terbitan sertifikat digital resmi berkop Dinas Kesehatan Sumbar dengan QR Code otentikasi.

---

## 3. Integrasi ke Remotion (React)

Jika Anda membuat video dengan Remotion (`npx create-video@latest`), Anda dapat menggunakan 2 pendekatan utama:

### Opsi A: Menggunakan `<Html>` / `iframe` di Remotion

Remotion mendukung rendering HTML statis langsung di dalam komposisi:

```tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";

export const EReportDemoVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0d13" }}>
      {/* Scene 1: 0 - 5 detik (150 frames @ 30fps) */}
      <Sequence from={0} durationInFrames={150}>
        <iframe
          src="/mockup-remotion.html#scene-1"
          style={{ width: 1920, height: 1080, border: "none" }}
        />
      </Sequence>

      {/* Scene 2: 5 - 12 detik */}
      <Sequence from={150} durationInFrames={210}>
        <iframe
          src="/mockup-remotion.html#scene-2"
          style={{ width: 1920, height: 1080, border: "none" }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

### Opsi B: Mengambil Screenshot Tiap Scene (Puppeteer / Browser)

1. Buka `mockup-remotion.html`.
2. Matikan bingkai dengan tombol `Window Frame: OFF` jika ingin tampilan layar penuh aplikasi.
3. Tekan angka `1` lalu screenshot (1920×1080), ulangi untuk `2`, `3`, `4`, `5`.
4. Masukkan aset gambar PNG ke folder `public/` Remotion dan kombinasikan dengan animasi zoom/pan (`interpolate`, `spring`).
