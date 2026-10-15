# E-Report PBOBA

Sistem Pelaporan dan Pemantauan Distribusi Obat Tradisional untuk Pedagang Besar Obat Tradisional (PBOT) di Sumatera Barat.

> **Status Proyek**: Prototipe Demonstrasi (M0 — Fondasi dan Konfigurasi Selesai)

---

## 1. Arsitektur & Teknologi

* **Frontend & Backend**: Next.js (App Router, TypeScript, Tailwind CSS)
* **Database**: PostgreSQL (Supabase) via Prisma ORM
* **Storage Utama**: Supabase Storage (Private Bucket via abstraksi `StorageProvider`)
* **Backup**: Google Drive API (Opsional)
* **Hosting**: Vercel Serverless

---

## 2. Struktur Data (4 Tabel Inti)

Sistem menggunakan tepat 4 tabel inti sesuai spesifikasi kebutuhan (SRS Bagian 4):
1. `users` — Data akun administrator dan entitas pelapor (PBOT).
2. `reports` — Metadata dan berkas laporan semesteran distribusi obat tradisional.
3. `backups` — Riwayat pencadangan berkas ke Google Drive.
4. `questions` — Tanya jawab antara reporter dan administrator.

Lihat dokumentasi lengkap di:
* [Entity Relationship Diagram (ERD)](docs/ERD.md)
* [Data Dictionary](docs/DATA_DICTIONARY.md)

---

## 3. Menjalankan Proyek Secara Lokal

### Prasyarat
* Node.js v20+ atau v24+
* Akun PostgreSQL Supabase

### Langkah Instalasi
1. Clone repositori:
   ```bash
   git clone https://github.com/supremeinori/ereport.git
   cd ereport
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables:
   Salin berkas `.env.example` menjadi `.env` lalu isi kredensial:
   ```bash
   cp .env.example .env
   ```

4. Jalankan Migrasi Database Prisma:
   ```bash
   npx prisma migrate dev
   ```

5. Buat Akun Admin Awal (Bootstrap):
   ```bash
   npm run bootstrap:admin
   ```

6. Jalankan Server Development:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.
