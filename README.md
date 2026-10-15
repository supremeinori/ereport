# E-Report PBOBA Sumatera Barat

Sistem Pelaporan dan Pemantauan Distribusi Obat Tradisional untuk Pedagang Besar Obat Tradisional (PBOT) di bawah pengawasan Dinas Kesehatan / Balai Besar POM di Sumatera Barat.

> **Status Proyek**: **Prototipe Lengkap — Seluruh Modul (M0 s/d M8) Selesai 100% dan Terverifikasi**

---

## 1. Papan Status Modul (SRS v1.1 Bagian 18)

| Modul | Nama Modul | Cakupan Kebutuhan | Status | Uji Otomatis |
|---|---|---|:---:|:---:|
| **M0** | Fondasi & Konfigurasi | Skema 4 tabel, Prisma 6, Storage Abstraction, Bootstrap Admin | ✅ Selesai | `npx prisma migrate` |
| **M1** | Autentikasi & Keamanan | Session HMAC SHA-256, Middleware Guard, Rate Limiter | ✅ Selesai | `npm run test:m1` |
| **M2** | Kelola Akun Reporter | Manajemen akun PBOT, pencarian nama/ID, toggle aktif/nonaktif | ✅ Selesai | `npm run test:m2` |
| **M3** | Pelaporan & Validasi File | Validasi .xlsx, magic bytes ZIP, anti-macro, safe file replacement | ✅ Selesai | `npm run test:m3` |
| **M4** | Unduh Aman & Template | Signed URL (60s), isolasi unduhan (404), kelola template admin | ✅ Selesai | `npm run test:m4` |
| **M5** | Dashboard Admin & Review | Metrik kepatuhan, filter tahun/semester, aksi tanda reviewed | ✅ Selesai | `npm run test:m5` |
| **M6** | Layanan Tanya Jawab | Validasi panjang teks, isolasi pertanyaan antar-PBOT, respon admin | ✅ Selesai | `npm run test:m6` |
| **M7** | Cadangan Google Drive | Pemantauan antrean backup, admin retry, toleransi non-konfigurasi | ✅ Selesai | `npm run test:m7` |
| **M8** | Dokumentasi & Deployment | Panduan Vercel, dokumentasi API, matriks pengujian menyeluruh | ✅ Selesai | `npm run test:all` |

---

## 2. Arsitektur & Teknologi

* **Frontend & Backend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
* **Database ORM**: PostgreSQL via Prisma 6 (Koneksi Pooler Port 6543 + Direct Port 5432)
* **Penyimpanan Berkas**: Supabase Storage (Private Bucket via abstraksi `StorageProvider`)
* **Pencadangan Sekunder**: Google Drive API v3 (Service Account JWT)
* **Sesi & Keamanan**: Token stateless bertanda tangan HMAC SHA-256 tersimpan di HttpOnly Cookie, verifikasi status akun aktif langsung ke database pada setiap request.

---

## 3. Struktur Database (Tepat 4 Tabel)

Sesuai aturan ketat spesifikasi kebutuhan, aplikasi **hanya menggunakan tepat 4 tabel**:
1. `users` — Akun Administrator dan Entitas Pelapor (PBOT).
2. `reports` — Metadata dan path berkas laporan semesteran distribusi obat tradisional.
3. `backups` — Riwayat pencadangan berkas ke Google Drive.
4. `questions` — Layanan tanya jawab dan asistensi teknis PBOT.

Dokumentasi basis data:
* [Entity Relationship Diagram (ERD)](docs/ERD.md)
* [Kamus Data (Data Dictionary)](docs/DATA_DICTIONARY.md)

---

## 4. Menjalankan Proyek Secara Lokal

### Prasyarat
* Node.js v20+ atau v24+
* Supabase PostgreSQL atau PostgreSQL lokal

### Langkah Cepat
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/supremeinori/ereport.git
   cd ereport
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env` dan lengkapi kredensial basis data serta session secret.

4. **Migrasi Basis Data**:
   ```bash
   npx prisma migrate deploy
   ```

5. **Inisialisasi Admin Awal**:
   ```bash
   npm run bootstrap:admin
   ```

6. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:3000`.

---

## 5. Pengujian Otomatis

Aplikasi dilengkapi suite pengujian otomatis untuk setiap modul:

```bash
# Uji modul spesifik
npm run test:m1    # Autentikasi & Rate Limiting
npm run test:m2    # Kelola Akun Reporter & Pencarian
npm run test:m3    # Validasi File & Safe Replacement
npm run test:m4    # Signed URL & Isolasi Akses Unduhan
npm run test:m5    # Metrik Dashboard & Pemeriksaan Laporan
npm run test:m6    # Tanya Jawab & Validasi Panjang Teks
npm run test:m7    # Integrasi Backup & Non-Destructive Failure

# Uji menyeluruh seluruh sistem (M8)
npm run test:all
```

---

## 6. Dokumentasi Lengkap
* [Dokumentasi API Lengkap](docs/API_DOCUMENTATION.md)
* [Panduan Deployment Vercel & Supabase](docs/DEPLOYMENT_GUIDE.md)
* [Entity Relationship Diagram (ERD)](docs/ERD.md)
* [Data Dictionary](docs/DATA_DICTIONARY.md)
