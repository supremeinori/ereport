# SRS — E-Report PBOBA

**Software Requirements Specification** untuk aplikasi web **E-Report PBOBA**
Sistem pelaporan dan pemantauan distribusi obat tradisional untuk Pedagang Besar Obat Tradisional (PBOT) di Sumatera Barat.

| Atribut | Nilai |
|---|---|
| Status dokumen | Draft v1.1 (v1.0 + bagian 18 Modul Sistem), patokan utama untuk AI builder |
| Jenis sistem | Prototipe demonstrasi (bukan sistem operasional resmi) |
| Bahasa antarmuka | Bahasa Indonesia |
| Pemilik keputusan | Pemilik proyek (lihat bagian 13) |

> **Cara membaca dokumen ini (untuk AI builder):**
> Kata **WAJIB** = harus dipenuhi. **DILARANG** = tidak boleh dilakukan tanpa persetujuan tertulis pemilik proyek. **DISARANKAN** = default yang baik, boleh menyimpang jika ada alasan dan dijelaskan. Setiap kebutuhan punya ID (mis. `FR-ADM-03`) agar bisa dirujuk di commit, pengujian, dan laporan.
>
> **Pemeriksaan per modul:** sistem dipecah menjadi modul `M0`–`M8` pada **bagian 18**. Setiap modul punya cakupan, kebutuhan terkait, checklist verifikasi, dan syarat selesai sendiri, sehingga pemilik proyek dapat memeriksa dan menyetujui sistem satu modul pada satu waktu. Bagian 18 hanya **menambah** pengelompokan; tidak mengubah atau mengurangi kebutuhan pada bagian 1–17.

---

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen ini mendefinisikan kebutuhan, batasan, arsitektur, model data, aturan keamanan, dan cara kerja pengembangan E-Report PBOBA. Dokumen ini adalah sumber kebenaran tunggal. Jika instruksi lain bertentangan, ikuti dokumen ini lalu tanyakan kepada pemilik proyek.

### 1.2 Peran AI builder
Bertindak sebagai **senior full-stack developer, software architect, database designer, dan application security engineer**.

### 1.3 Ruang lingkup
Aplikasi memungkinkan:
- **Reporter** (entitas PBOT) mengunggah laporan semesteran berformat Excel, memantau status pemeriksaan, dan bertanya kepada admin.
- **Admin** mengelola akun reporter, memantau kelengkapan laporan per periode, memeriksa laporan, menjawab pertanyaan, dan melihat status backup.

### 1.4 Di luar ruang lingkup (DILARANG tanpa persetujuan)
- Registrasi publik.
- Peringatan email otomatis.
- Penghitungan keterlambatan otomatis atau tenggat otomatis (aturan tenggat belum ditentukan).
- Workflow revisi lengkap (hanya status `revision_required` yang disiapkan).
- Tabel inti kelima.
- Fitur apa pun di luar daftar pada bagian 6 dan 7.

### 1.5 Definisi
| Istilah | Arti |
|---|---|
| PBOT | Pedagang Besar Obat Tradisional |
| Reporter | Akun entitas pelapor (role `reporter`) |
| Admin | Akun administrator (role `admin`) |
| Periode | Kombinasi `period_year` + `period_semester` (1 atau 2) |
| Storage utama | Supabase Storage (bucket privat) |
| Backup | Salinan tambahan file laporan di Google Drive |

---

## 2. Gambaran Umum Sistem

### 2.1 Pengguna
| Role | Hak akses ringkas |
|---|---|
| `admin` | Melihat seluruh data reporter, membuat/menonaktifkan akun, memeriksa laporan, menjawab pertanyaan, melihat status backup |
| `reporter` | Hanya data miliknya: unggah/unduh laporan sendiri, kirim dan lihat pertanyaan sendiri |

### 2.2 Asumsi
- Ini prototipe demo; data yang dipakai adalah **data dummy**.
- Skala kecil (puluhan sampai ratusan reporter).
- Format laporan adalah template Excel resmi yang disediakan admin.
- Tidak ada aturan tenggat pelaporan.

### 2.3 Prinsip pengembangan
1. Utamakan solusi paling sederhana yang tetap aman dan dapat dikembangkan.
2. Jangan menambah dependensi hanya karena tersedia.
3. Jangan mengubah kebutuhan bisnis tanpa persetujuan.
4. Jika ada dua pendekatan masuk akal, jelaskan trade-off dan rekomendasikan satu.
5. Bedakan secara jujur: **sudah diimplementasikan**, **masih rancangan**, **belum diuji**.

---

## 3. Arsitektur dan Teknologi

### 3.1 Stack (WAJIB)
| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | Next.js Route Handlers dan/atau Server Actions |
| Hosting | Vercel Free (demo) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma (PostgreSQL standar, migration files di Git) |
| Storage file utama | Supabase Storage, akses **privat** |
| Backup file | Google Drive API (opsional, aktif jika kredensial tersedia) |

### 3.2 Prinsip arsitektur
- **ARC-01** Frontend dan backend satu proyek Next.js, tanggung jawab dipisahkan secara logis (UI, logika bisnis/service, akses data).
- **ARC-02** Gunakan PostgreSQL standar. Hindari fitur khusus Supabase bila alternatif PostgreSQL standar memadai.
- **ARC-03** DILARANG memakai Supabase Auth. Autentikasi dikelola aplikasi sendiri lewat tabel `users`.
- **ARC-04** Supabase hanya penyedia PostgreSQL dan object storage.
- **ARC-05** WAJIB ada lapisan abstraksi storage (mis. interface `StorageProvider`) agar implementasi bisa diganti tanpa mengubah logika bisnis.
- **ARC-06** DILARANG menyimpan file laporan di filesystem lokal server Vercel.
- **ARC-07** Semua konfigurasi sensitif lewat environment variables.
- **ARC-08** DILARANG mengekspos database credentials, secret key, atau kredensial Google Drive ke browser.
- **ARC-09** Pisahkan model database dari logika bisnis aplikasi.

---

## 4. Model Data

Empat tabel inti adalah **batas model data**. DILARANG menambah tabel kelima tanpa persetujuan. Jika autentikasi memerlukan penyimpanan sesi tambahan, jelaskan kebutuhan dan alternatifnya terlebih dahulu (lihat bagian 13).

### 4.1 Tabel `users`
Menyimpan akun admin dan entitas pelapor.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID, PK | |
| `identifier` | text, unique, not null | Kode unik entitas/pengguna |
| `name` | text, not null | Nama pengguna atau badan usaha |
| `email` | text, unique, not null | |
| `password_hash` | text, not null | Hash, bukan password asli |
| `role` | enum(`admin`,`reporter`), not null | |
| `is_active` | boolean, not null | Status akun |
| `created_at` | timestamptz, not null | |
| `updated_at` | timestamptz, not null | |

Ketentuan:
- Akun reporter dibuat oleh admin; tidak ada registrasi publik.
- Setiap reporter terikat pada satu akun dan satu identitas entitas terdaftar.
- Admin dapat mengaktifkan/menonaktifkan akun.
- Password tidak pernah disimpan plaintext; `password_hash` tidak pernah dikembalikan di respons API.

### 4.2 Tabel `reports`
Metadata dan status laporan semesteran.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id`, not null | |
| `period_year` | int, not null | Tahun pelaporan |
| `period_semester` | smallint, not null | Hanya 1 atau 2 (CHECK) |
| `file_path` | text, not null | Object key di storage |
| `original_filename` | text, not null | |
| `uploaded_at` | timestamptz, not null | Tampilkan dalam zona waktu Indonesia bila perlu |
| `status` | enum, not null | `pending_review`, `reviewed`, `revision_required` |
| `reviewed_at` | timestamptz, nullable | |
| `created_at` | timestamptz, not null | |
| `updated_at` | timestamptz, not null | |

Ketentuan:
- **UNIQUE** (`user_id`, `period_year`, `period_semester`).
- Unggah ulang untuk periode sama = **penggantian file pada record yang sama** dengan prosedur aman: unggah file baru, pastikan sukses, update record, baru hapus file lama. DILARANG menghapus file lama sebelum penggantian berhasil.
- DILARANG menetapkan tenggat otomatis atau menandai "terlambat" berdasarkan waktu unggah.
- `revision_required` disiapkan sebagai nilai status, tetapi alur revisi lengkap tidak dibangun di MVP.

### 4.3 Tabel `backups`
Pencatatan pencadangan file laporan ke Google Drive.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID, PK | |
| `report_id` | UUID, FK → `reports.id`, not null | |
| `provider` | text, not null | Saat ini `google_drive` |
| `drive_file_id` | text, nullable | Terisi jika berhasil |
| `backup_status` | enum, not null | `pending`, `success`, `failed` |
| `backed_up_at` | timestamptz, nullable | Waktu backup berhasil |
| `error_message` | text, nullable | Info kegagalan (tanpa data sensitif) |
| `created_at` | timestamptz, not null | |
| `updated_at` | timestamptz, not null | |

Ketentuan:
- File utama tetap di storage utama; backup hanya salinan tambahan.
- Kegagalan backup TIDAK BOLEH menghilangkan atau merusak laporan utama.
- Simpan info kegagalan dan sediakan retry.
- DILARANG mengklaim sukses sebelum Google Drive mengonfirmasi.
- Jika Google Drive belum dikonfigurasi, aplikasi tetap berjalan dan UI menampilkan status yang jelas.

### 4.4 Tabel `questions`
Tanya jawab sederhana reporter ↔ admin.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID, PK | |
| `user_id` | UUID, FK → `users.id`, not null | Penanya |
| `subject` | text, not null | Ada batas panjang |
| `question` | text, not null | Ada batas panjang |
| `answer` | text, nullable | Null sebelum dijawab |
| `answered_by` | UUID, FK → `users.id`, nullable | Harus role `admin` |
| `status` | enum, not null | `open`, `answered` |
| `created_at` | timestamptz, not null | |
| `answered_at` | timestamptz, nullable | |
| `updated_at` | timestamptz, not null | |

### 4.5 Aturan desain database
- **DB-01** Gunakan foreign key, unique, not-null, dan index yang sesuai (minimal index pada `reports(period_year, period_semester)`, `reports(user_id)`, `questions(user_id)`, `questions(status)`, `backups(report_id)`).
- **DB-02** UUID dan timestamp dipakai konsisten (`timestamptz`, simpan UTC).
- **DB-03** Perilaku `ON DELETE` ditentukan **eksplisit** untuk setiap FK. DISARANKAN `RESTRICT`; hindari cascade berantai. Akun tidak dihapus, cukup dinonaktifkan.
- **DB-04** Perubahan skema hanya lewat **migration Prisma**; skema harus bisa direkonstruksi dari migration files, bukan konfigurasi dashboard Supabase.
- **DB-05** DILARANG mengubah struktur database produksi atau menghapus data tanpa persetujuan.
- **DB-06** DILARANG menyimpan data yang sama di beberapa tabel tanpa kebutuhan jelas.
- **DB-07** Buat dokumentasi **ERD** dan **data dictionary**.

---

## 5. Kebutuhan Keamanan dan Autentikasi

Autentikasi **dikelola aplikasi sendiri**, tanpa Supabase Auth.

| ID | Kebutuhan |
|---|---|
| SEC-01 | Login dengan email + password. |
| SEC-02 | Hash password dengan Argon2id atau bcrypt berkonfigurasi aman. |
| SEC-03 | Sesi aman. Jika cookie: `HttpOnly`, `Secure` (HTTPS), `SameSite` tepat. |
| SEC-04 | DILARANG menyimpan token autentikasi sensitif di `localStorage`. |
| SEC-05 | Autentikasi dan otorisasi diperiksa **di server** untuk setiap endpoint terlindungi. |
| SEC-06 | Menyembunyikan tombol/halaman di frontend **bukan** kontrol akses. |
| SEC-07 | Reporter hanya mengakses laporan dan pertanyaan miliknya sendiri. |
| SEC-08 | Admin mengakses data seluruh reporter sesuai kewenangan. |
| SEC-09 | Akun nonaktif tidak bisa login dan akses yang sudah ada harus ikut dicabut (cek `is_active` pada setiap request terlindungi, bukan hanya saat login). |
| SEC-10 | Lindungi endpoint pengubah data dari CSRF bila mekanisme auth memerlukannya. |
| SEC-11 | Validasi input di server; tangani error tanpa membocorkan stack trace atau rahasia. |
| SEC-12 | Pembatasan percobaan login yang wajar (rate limiting). |
| SEC-13 | Admin awal dibuat lewat prosedur bootstrap aman (mis. script satu kali dengan kredensial dari env). DILARANG menanam password admin di source code. |
| SEC-14 | DILARANG mencatat password, token, atau kredensial ke log. |
| SEC-15 | Row Level Security Supabase **tidak** dianggap melindungi aplikasi bila semua query lewat backend dengan kredensial server; otorisasi server tetap wajib. Jika akses DB langsung dari browser diperlukan, jelaskan risiko dan rancangan kebijakan terlebih dahulu. |

---

## 6. Kebutuhan Fungsional — Administrator

| ID | Kebutuhan |
|---|---|
| FR-ADM-01 | Login dan logout. |
| FR-ADM-02 | Ringkasan jumlah entitas pelapor. |
| FR-ADM-03 | Jumlah laporan **sudah masuk** dan **belum masuk** untuk periode terpilih. |
| FR-ADM-04 | Filter tahun dan semester. |
| FR-ADM-05 | Daftar seluruh entitas pelapor. |
| FR-ADM-06 | Pencarian berdasarkan nama atau identifier. |
| FR-ADM-07 | Pembuatan akun reporter. |
| FR-ADM-08 | Aktifkan/nonaktifkan akun (dengan konfirmasi). |
| FR-ADM-09 | Daftar laporan berdasarkan periode. |
| FR-ADM-10 | Melihat status pemeriksaan laporan. |
| FR-ADM-11 | Mengunduh file laporan secara aman. |
| FR-ADM-12 | Menandai laporan sebagai `reviewed` (mengisi `reviewed_at`). |
| FR-ADM-13 | Melihat pertanyaan masuk dan mengirim jawaban. |
| FR-ADM-14 | Melihat status backup setiap laporan dan memicu retry bila `failed`. |
| FR-ADM-15 | Mengelola (mengunggah) template Excel resmi yang diunduh reporter. |

> Catatan FR-ADM-15: dokumen sumber menyebut "template Excel resmi yang disediakan administrator" tetapi tidak merinci mekanisme penyediaannya. Mekanisme paling sederhana (mis. file statis atau satu objek di storage) harus **diusulkan dan disetujui** pada Tahap 2 sebelum dibangun, tanpa menambah tabel.

---

## 7. Kebutuhan Fungsional — Reporter

| ID | Kebutuhan |
|---|---|
| FR-REP-01 | Login dan logout. |
| FR-REP-02 | Melihat identitas akun dan entitasnya. |
| FR-REP-03 | Melihat instruksi pelaporan. |
| FR-REP-04 | Mengunduh template Excel resmi. |
| FR-REP-05 | Memilih tahun dan semester pelaporan. |
| FR-REP-06 | Mengunggah file Excel yang sudah diisi. |
| FR-REP-07 | Melihat waktu unggah dan status pemeriksaan. |
| FR-REP-08 | Mengunduh kembali laporan miliknya. |
| FR-REP-09 | Mengirim pertanyaan ke admin. |
| FR-REP-10 | Melihat jawaban admin atas pertanyaannya. |

Pembatasan: reporter **tidak boleh** membuat akun sendiri, memilih identitas entitas lain, mengubah status laporan, atau menjawab pertanyaan.

---

## 8. Upload, Download, dan Penyimpanan File

| ID | Kebutuhan |
|---|---|
| FILE-01 | Terima hanya format yang dibutuhkan, mis. `.xlsx`. |
| FILE-02 | Validasi di server: ekstensi, MIME type (bila relevan), ukuran maksimum, dan nama file. |
| FILE-03 | Pemeriksaan ekstensi saja **tidak cukup**; tambahkan pemeriksaan isi dasar (mis. signature/magic bytes ZIP untuk `.xlsx`). |
| FILE-04 | Nama object storage tidak mudah ditebak (mis. berbasis UUID, bukan nama asli). Nama asli disimpan di `original_filename`. |
| FILE-05 | Metadata di tabel `reports`; file fisik di storage. |
| FILE-06 | Bucket dan file **tidak publik**. |
| FILE-07 | Download memakai signed URL berumur pendek atau mekanisme server aman, **setelah** server memverifikasi hak akses peminta. |
| FILE-08 | Hindari mengirim file besar lewat request body fungsi Vercel (batas ukuran body serverless); DISARANKAN unggah langsung ke storage lewat signed upload URL yang diterbitkan server setelah otorisasi, lalu server memvalidasi dan mencatat metadata. Jelaskan pilihan dan trade-off ke pemilik proyek. |
| FILE-09 | DILARANG proses berat yang tidak perlu hanya untuk menyimpan laporan. |
| FILE-10 | DILARANG membaca atau mengeksekusi macro/konten aktif dari file unggahan. |
| FILE-11 | Penggantian file (unggah ulang) mengikuti prosedur aman di bagian 4.2. |

---

## 9. Integrasi Backup Google Drive

Desain harus **dapat diaktifkan setelah kredensial tersedia** dan opsional.

Alur:
1. Reporter mengunggah file ke storage utama.
2. Sistem menyimpan metadata laporan.
3. Sistem mencatat record backup berstatus `pending`.
4. Proses backup mengirim salinan ke Google Drive.
5. Jika berhasil: simpan `drive_file_id`, `backed_up_at`, status `success`.
6. Jika gagal: simpan `error_message`, status `failed`, sediakan retry.

Ketentuan:
- **BKP-01** Proses unggah utama tidak menunggu backup terlalu lama.
- **BKP-02** Sesuaikan dengan keterbatasan serverless Vercel; DILARANG mengandalkan proses latar belakang yang tidak dijamin jalan setelah respons selesai. Usulkan pola (mis. backup dipicu terpisah, endpoint retry oleh admin, atau Vercel Cron) beserta trade-off sebelum implementasi.
- **BKP-03** Kredensial Google Drive hanya di server (env), tidak pernah di frontend.
- **BKP-04** Jika integrasi belum dikonfigurasi, aplikasi berjalan normal dan UI menampilkan status backup yang jelas.

---

## 10. Antarmuka dan Pengalaman Pengguna

- **UI-01** Profesional, sederhana, responsif.
- **UI-02** Bahasa antarmuka: **Bahasa Indonesia**.
- **UI-03** Prioritaskan keterbacaan tabel, filter, status, dan formulir.
- **UI-04** Indikator status konsisten (`pending_review`, `reviewed`, `revision_required`, `pending/success/failed`, `open/answered`).
- **UI-05** Sediakan loading state, empty state, error state, dan konfirmasi untuk tindakan penting.
- **UI-06** Data dummy harus diberi label jelas, tidak ditampilkan sebagai data nyata.
- **UI-07** Hindari animasi dan komponen berlebihan yang tidak membantu pelaporan.
- **UI-08** Waktu ditampilkan dalam zona waktu Indonesia (mis. WIB) saat dibutuhkan.

---

## 11. Kebutuhan Non-Fungsional

| ID | Kebutuhan |
|---|---|
| NFR-01 | **Portabilitas**: dapat dipindah ke infrastruktur lain (PostgreSQL standar, abstraksi storage, migration di Git). |
| NFR-02 | **Maintainability**: struktur kode terorganisasi, pemisahan UI / service / akses data. |
| NFR-03 | **Kesederhanaan**: minim dependensi; setiap dependensi baru dijelaskan alasannya. |
| NFR-04 | **Keamanan secret**: tidak ada secret di Git; hanya `.env.example` tanpa nilai rahasia. |
| NFR-05 | **Ketahanan**: aplikasi berjalan tanpa integrasi Google Drive. |
| NFR-06 | **Validasi input** server-side dengan batas panjang teks yang wajar. |
| NFR-07 | **Data uji**: hanya data dummy; DILARANG memakai data pribadi atau laporan asli pada pengujian/demo publik. |

---

## 12. Pengujian Wajib

| ID | Kasus uji |
|---|---|
| TST-01 | Login berhasil dan gagal. |
| TST-02 | Reporter nonaktif tidak dapat mengakses sistem (termasuk sesi yang sudah berjalan). |
| TST-03 | Reporter A tidak dapat melihat atau mengunduh laporan Reporter B. |
| TST-04 | Reporter tidak dapat mengakses dashboard admin. |
| TST-05 | Reporter tidak dapat menjawab pertanyaan atau mengubah status laporan secara langsung (uji langsung ke endpoint, bukan lewat UI). |
| TST-06 | Admin dapat melihat data seluruh reporter. |
| TST-07 | Filter tahun dan semester benar. |
| TST-08 | Unique constraint mencegah laporan aktif ganda untuk periode yang sama. |
| TST-09 | File yang tidak sesuai ketentuan ditolak (ekstensi, ukuran, isi). |
| TST-10 | Kegagalan backup tidak merusak laporan utama. |
| TST-11 | Status `reviewed` tersimpan dan tampil benar. |
| TST-12 | API tidak membocorkan password hash, secret, atau informasi internal sensitif. |

Sertakan petunjuk menjalankan pengujian secara lokal.

---

## 13. Keputusan yang Wajib Dikonsultasikan Dulu

Beri tahu pemilik proyek **sebelum** melakukan hal berikut:
- Keputusan yang memengaruhi **keamanan, biaya, migrasi database, atau kompleksitas pemeliharaan**.
- Kebutuhan penyimpanan sesi tambahan (jelaskan alternatif: sesi stateless bertanda tangan/terenkripsi di cookie vs tabel sesi; jangan tambah tabel tanpa izin).
- Mekanisme template Excel resmi (FR-ADM-15).
- Pola unggah file (lewat server vs signed upload URL) dan pola eksekusi backup di serverless.
- Migration destruktif, penimpaan konfigurasi yang sudah ada, atau akses DB langsung dari browser.
- Penambahan dependensi non-esensial.

---

## 14. Dokumentasi dan Deliverable

- `.env.example` tanpa nilai rahasia.
- `README` berbahasa Indonesia.
- Instalasi lokal.
- Konfigurasi database dan migration.
- Konfigurasi Supabase Storage.
- Konfigurasi autentikasi aplikasi sendiri.
- Deployment Vercel.
- Integrasi Google Drive (opsional).
- ERD dan data dictionary.
- Daftar endpoint: autentikasi, role, input, output.
- Panduan seed data dummy.
- Hasil pengujian yang jujur.

---

## 15. Alur Kerja Pengembangan (WAJIB bertahap)

Jangan menghasilkan seluruh aplikasi dalam satu langkah tanpa pemeriksaan. **Mulai dari Tahap 1, lalu tunggu persetujuan pemilik proyek sebelum perubahan besar.**

### Tahap 1 — Analisis
- Periksa struktur proyek dan file yang sudah ada.
- Identifikasi teknologi dan konfigurasi saat ini.
- Rangkum kebutuhan dan asumsi.
- Tunjukkan rancangan arsitektur, ERD, skema database, dan alur autentikasi.
- Identifikasi risiko teknis sebelum implementasi.

### Tahap 2 — Persetujuan desain
- Ajukan rancangan skema dan keputusan penting untuk ditinjau.
- Jangan membuat migration destruktif atau menimpa konfigurasi yang ada tanpa persetujuan.

### Tahap 3 — Fondasi
- Konfigurasi Next.js, TypeScript, Prisma, PostgreSQL.
- Implementasikan empat tabel inti.
- Buat migration dan seed data dummy.
- Implementasikan autentikasi dan otorisasi.

### Tahap 4 — Fitur utama
- Dashboard admin.
- Manajemen akun reporter.
- Upload dan download laporan.
- Filter tahun dan semester.
- Pemeriksaan laporan.
- Tanya jawab.
- Status dan retry backup.

### Tahap 5 — Validasi
- Jalankan pemeriksaan TypeScript, lint, migration, dan pengujian yang tersedia.
- Laporkan hasil **secara jujur**; DILARANG mengklaim fitur atau pengujian berhasil bila belum dijalankan.
- Perbaiki masalah dan dokumentasikan yang belum terselesaikan.

### Tahap 6 — Deployment demonstrasi
- Langkah konfigurasi environment variables di Vercel.
- Cara menghubungkan PostgreSQL dan storage.
- Pastikan tidak ada secret di Git.
- Pastikan aplikasi berjalan tanpa integrasi Google Drive bila belum disiapkan.

> **Hubungan dengan modul (bagian 18):** Tahap 3 mencakup modul M0–M1, Tahap 4 mencakup modul M2–M7, dan Tahap 5–6 mencakup modul M8. Di dalam tiap tahap, modul dikerjakan dan diserahkan **satu per satu** untuk diperiksa pemilik proyek.

---

## 16. Prinsip Komunikasi AI Builder

Pemilik proyek ingin memahami alasan di balik implementasi. Karena itu:
- Jelaskan alasan pemilihan teknologi dan pola desain secara **ringkas**.
- Pada setiap laporan kemajuan, beri label status: ✅ diimplementasikan, 📐 rancangan, ⚠️ belum diuji.
- Jangan mengubah kebutuhan bisnis tanpa persetujuan.
- Jangan membangun fitur di luar ruang lingkup tanpa persetujuan.

---

## 17. Matriks Ringkas Akses (Referensi Uji Otorisasi)

| Sumber daya | Admin | Reporter (pemilik) | Reporter (bukan pemilik) |
|---|---|---|---|
| Daftar/ubah akun reporter | ✅ | ❌ | ❌ |
| Lihat laporan | ✅ semua | ✅ miliknya | ❌ |
| Unggah laporan | ❌ (tidak diperlukan) | ✅ miliknya | ❌ |
| Unduh laporan | ✅ semua | ✅ miliknya | ❌ |
| Ubah status laporan ke `reviewed` | ✅ | ❌ | ❌ |
| Kirim pertanyaan | ❌ (tidak diperlukan) | ✅ | ❌ |
| Lihat pertanyaan | ✅ semua | ✅ miliknya | ❌ |
| Jawab pertanyaan | ✅ | ❌ | ❌ |
| Lihat/retry status backup | ✅ | ❌ | ❌ |

> Baris "tidak diperlukan" adalah turunan dari daftar fitur pada bagian 6 dan 7, bukan kebutuhan baru. Jika ingin admin juga bisa mengunggah atas nama reporter atau bertanya, itu perubahan ruang lingkup dan harus disetujui dulu.

---

## 18. Modul Sistem (Unit Pemeriksaan)

Bagian ini **hanya menambah** pengelompokan kebutuhan ke dalam modul agar sistem dapat diperiksa per modul. Tidak ada kebutuhan pada bagian 1–17 yang diubah atau dikurangi. Jika ada selisih antara bagian ini dan bagian 1–17, bagian 1–17 yang berlaku, lalu tanyakan kepada pemilik proyek.

### 18.1 Aturan kerja per modul

| ID | Aturan |
|---|---|
| MOD-01 | Bangun dan serahkan **satu modul pada satu waktu** sesuai urutan dependensi (18.3). Jangan lanjut ke modul berikutnya sebelum pemilik proyek menyetujui modul sebelumnya. |
| MOD-02 | Setiap modul diserahkan bersama **Laporan Modul** (format di 18.5). |
| MOD-03 | Modul dianggap **selesai (Definition of Done)** hanya jika: (a) semua kebutuhan terkait terimplementasi, (b) seluruh checklist verifikasi modul terpenuhi, (c) uji terkait sudah **dijalankan** dan hasilnya dilaporkan jujur, (d) pemeriksaan TypeScript dan lint lulus, (e) tidak ada secret, `password_hash`, atau stack trace pada respons, (f) dokumentasi terkait diperbarui. |
| MOD-04 | Otorisasi server (SEC-05 sampai SEC-08) diverifikasi **di setiap modul yang punya endpoint**, bukan hanya di M1. |
| MOD-05 | Modul tidak boleh menambah fitur, tabel, atau dependensi di luar yang tertulis. Kebutuhan baru wajib ditanyakan dulu. |
| MOD-06 | Perubahan yang berdampak lintas modul (mis. mengubah skema yang sudah dipakai modul sebelumnya) harus diberi tahu, dan modul terdampak diuji ulang (regresi). |
| MOD-07 | Daftar halaman dan endpoint pada tiap modul bersifat **indikatif**. Daftar final harus tercatat di dokumentasi endpoint (bagian 14) dan disetujui saat penyerahan modul. |

### 18.2 Ringkasan modul

| Kode | Modul | Ringkasan | Tabel utama | Peran terkait |
|---|---|---|---|---|
| **M0** | Fondasi dan Konfigurasi | Proyek, skema, migration, abstraksi storage, seed, bootstrap admin | semua (pembuatan skema) | pengembang |
| **M1** | Autentikasi dan Otorisasi | Login/logout, sesi, otorisasi server, rate limit, akun nonaktif | `users` | admin, reporter |
| **M2** | Manajemen Akun Reporter | Buat, cari, daftar, aktif/nonaktif akun; identitas akun reporter | `users` | admin, reporter |
| **M3** | Pelaporan dan Unggah File | Instruksi, pilih periode, unggah/ganti file Excel, status unggah | `reports` | reporter |
| **M4** | Unduh Aman dan Template Excel | Unduh laporan oleh pemilik/admin, template resmi | `reports` | admin, reporter |
| **M5** | Dashboard Admin dan Pemeriksaan | Ringkasan, filter periode, daftar laporan, tandai `reviewed` | `users`, `reports` | admin |
| **M6** | Tanya Jawab | Kirim pertanyaan, jawab, lihat jawaban | `questions` | admin, reporter |
| **M7** | Backup Google Drive | Pencatatan, eksekusi, status, dan retry backup | `backups` | admin (sistem) |
| **M8** | Dokumentasi, Pengujian Menyeluruh, Deployment | Dokumen, seluruh uji wajib, deploy demo | semua | pengembang |

### 18.3 Urutan dan dependensi

| Modul | Bergantung pada | Tahap (bagian 15) |
|---|---|---|
| M0 | (tidak ada) | Tahap 3 |
| M1 | M0 | Tahap 3 |
| M2 | M0, M1 | Tahap 4 |
| M3 | M0, M1, M2 | Tahap 4 |
| M4 | M3 | Tahap 4 |
| M5 | M3 (data laporan), M2 (data reporter) | Tahap 4 |
| M6 | M1, M2 | Tahap 4 |
| M7 | M3, M4 (akses file untuk disalin) | Tahap 4 |
| M8 | M0 sampai M7 | Tahap 5–6 |

Urutan pemeriksaan yang disarankan: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8**.

### 18.4 Detail modul

#### M0 — Fondasi dan Konfigurasi

| Aspek | Isi |
|---|---|
| Tujuan | Proyek berjalan lokal, skema database terbentuk dari migration, storage terabstraksi, data dummy dan admin awal tersedia. |
| Tabel | `users`, `reports`, `backups`, `questions` (pembuatan skema). |
| Kebutuhan terkait | ARC-01 sampai ARC-09, DB-01 sampai DB-07, SEC-13, NFR-01 sampai NFR-04, NFR-07. |
| Keluaran | Struktur proyek Next.js + TypeScript; skema Prisma dan migration awal; interface `StorageProvider` beserta implementasi Supabase Storage; seed data dummy berlabel; script bootstrap admin; `.env.example`; draf ERD dan data dictionary. |
| Halaman/endpoint | Belum ada (fondasi). |
| Keputusan sebelum build | Struktur folder; versi Next.js dan Prisma; pilihan `ON DELETE` per FK (disarankan `RESTRICT`). |

Checklist verifikasi:
- [ ] Proyek dapat diinstal, dijalankan (`dev`) dan di-build tanpa error.
- [ ] Pemeriksaan TypeScript dan lint lulus.
- [ ] Migration dari database **kosong** membentuk empat tabel persis sesuai bagian 4.
- [ ] Ada UNIQUE (`user_id`, `period_year`, `period_semester`) dan CHECK `period_semester` hanya 1 atau 2.
- [ ] `ON DELETE` ditentukan eksplisit pada setiap foreign key.
- [ ] Index sesuai DB-01 tersedia.
- [ ] Tidak ada tabel kelima.
- [ ] Logika bisnis memakai interface `StorageProvider`, tidak mengimpor SDK Supabase langsung.
- [ ] Seed dummy berjalan dan data diberi label dummy.
- [ ] Admin awal dibuat lewat bootstrap dari environment variable; tidak ada password tertanam di source code (diperiksa dengan pencarian).
- [ ] `.env.example` tanpa nilai rahasia; `.env` masuk `.gitignore`.
- [ ] ERD dan data dictionary tersedia.

Uji terkait: pengujian skema/migration (mendukung TST-08).

#### M1 — Autentikasi dan Otorisasi

| Aspek | Isi |
|---|---|
| Tujuan | Hanya pengguna sah yang masuk; akses dibatasi per role di server. |
| Tabel | `users`. |
| Kebutuhan terkait | FR-ADM-01, FR-REP-01, SEC-01 sampai SEC-12, SEC-14, SEC-15, UI-05 (form login). |
| Keluaran | Login/logout; helper otorisasi server (mis. `requireAuth`, `requireRole`) yang **dipakai semua endpoint**; guard halaman; pembatasan percobaan login. |
| Halaman/endpoint (indikatif) | Halaman login; `POST /api/auth/login`; `POST /api/auth/logout`; guard untuk area admin dan reporter. |
| Keputusan sebelum build | Sesi stateless (cookie bertanda tangan/terenkripsi) vs tabel sesi (bagian 13); media penyimpanan penghitung rate limit tanpa tabel baru beserta keterbatasannya di serverless; pilihan Argon2id atau bcrypt. |

Checklist verifikasi:
- [ ] Login berhasil dengan kredensial benar; gagal dengan pesan generik (tidak membedakan email salah vs password salah).
- [ ] Password tersimpan sebagai hash; tidak ada plaintext di DB, log, atau respons.
- [ ] Cookie sesi `HttpOnly`, `Secure` (HTTPS), `SameSite` sesuai; tidak ada token di `localStorage`.
- [ ] Akun `is_active = false` tidak bisa login **dan** sesi yang sudah berjalan ikut ditolak pada request berikutnya.
- [ ] Setiap endpoint terlindungi memeriksa autentikasi dan role di server (diuji langsung ke endpoint tanpa lewat UI).
- [ ] Reporter tidak bisa membuka halaman/endpoint admin.
- [ ] Rate limit login bekerja dan keterbatasannya didokumentasikan.
- [ ] Proteksi CSRF diterapkan pada endpoint pengubah data bila diperlukan oleh mekanisme sesi.
- [ ] Error tidak membocorkan stack trace atau rahasia.
- [ ] Logout menghapus sesi.

Uji terkait: TST-01, TST-02, TST-04, TST-12.

#### M2 — Manajemen Akun Reporter

| Aspek | Isi |
|---|---|
| Tujuan | Admin mengelola entitas pelapor; reporter melihat identitas akunnya. |
| Tabel | `users`. |
| Kebutuhan terkait | FR-ADM-05, FR-ADM-06, FR-ADM-07, FR-ADM-08, FR-REP-02; ketentuan bagian 4.1; NFR-06. |
| Keluaran | Daftar reporter dengan pencarian nama/identifier; form buat akun; aksi aktif/nonaktif dengan konfirmasi; halaman identitas akun reporter. |
| Halaman/endpoint (indikatif) | Halaman daftar dan buat reporter (admin); `GET/POST /api/admin/reporters`; `PATCH /api/admin/reporters/:id/active`; halaman profil reporter. |
| Keputusan sebelum build | Cara pengaturan password awal reporter yang aman tanpa fitur di luar ruang lingkup (mis. password sementara dari admin). Dokumen sumber belum menentukannya. |

Checklist verifikasi:
- [ ] Hanya admin yang dapat membuat akun reporter; tidak ada registrasi publik.
- [ ] `email` dan `identifier` unik; duplikat ditolak dengan pesan jelas.
- [ ] Role akun yang dibuat selalu `reporter` (tidak dapat diubah lewat input klien).
- [ ] Pencarian berdasarkan nama atau identifier berfungsi.
- [ ] Menonaktifkan akun memakai konfirmasi dan langsung mencabut akses (diuji dengan sesi reporter yang sedang aktif).
- [ ] Mengaktifkan kembali akun berfungsi.
- [ ] Reporter hanya melihat identitas akunnya sendiri dan tidak dapat mengubah identitas entitas.
- [ ] Respons API tidak pernah memuat `password_hash`.
- [ ] Validasi input server-side dan batas panjang wajar.
- [ ] Loading, empty, dan error state tersedia.

Uji terkait: TST-02, TST-06, TST-12.

#### M3 — Pelaporan dan Unggah File

| Aspek | Isi |
|---|---|
| Tujuan | Reporter mengunggah laporan semesteran Excel dengan aman dan melihat status unggahnya. |
| Tabel | `reports` (serta pembuatan record `backups` berstatus `pending`; logika backup ada di M7). |
| Kebutuhan terkait | FR-REP-03, FR-REP-05, FR-REP-06, FR-REP-07; FILE-01 sampai FILE-06, FILE-08 sampai FILE-11; ketentuan bagian 4.2; BKP-01 (unggah tidak menunggu backup); UI-04, UI-05, UI-08. |
| Keluaran | Halaman instruksi pelaporan; pemilihan tahun dan semester; unggah dan penggantian file; tampilan waktu unggah dan status pemeriksaan. |
| Halaman/endpoint (indikatif) | Halaman pelaporan reporter; endpoint penerbitan izin unggah (jika memakai signed upload URL) dan endpoint finalisasi/pencatatan metadata. |
| Keputusan sebelum build | Pola unggah (lewat server vs signed upload URL) dan trade-off-nya (FILE-08); batas ukuran maksimum; rentang tahun yang valid; **status laporan setelah unggah ulang** (apakah kembali ke `pending_review`), karena belum ditentukan. |

Checklist verifikasi:
- [ ] Bucket storage privat; file tidak dapat diakses publik.
- [ ] Hanya `.xlsx` yang diterima; ekstensi, MIME type, ukuran, nama file, dan signature isi divalidasi di server.
- [ ] File tidak sesuai ditolak dengan pesan yang jelas.
- [ ] Object key tidak mudah ditebak (UUID); nama asli hanya di `original_filename`.
- [ ] `user_id` laporan diambil dari sesi, **bukan** dari input klien.
- [ ] Unggah pertama untuk suatu periode membuat tepat satu record `reports` berstatus `pending_review`.
- [ ] Unggah ulang untuk periode yang sama menggantikan file pada record yang sama; file lama dihapus **setelah** penggantian berhasil.
- [ ] Jika penggantian gagal, file dan record lama tetap utuh.
- [ ] UNIQUE (`user_id`, `period_year`, `period_semester`) mencegah laporan ganda.
- [ ] `uploaded_at` tersimpan benar dan tampil dalam zona waktu Indonesia.
- [ ] Tidak ada macro atau konten aktif yang dibaca/dieksekusi.
- [ ] Tidak ada file disimpan di filesystem lokal server Vercel.
- [ ] Tidak ada tenggat otomatis atau label "terlambat".
- [ ] Unggah tidak menunggu proses backup.

Uji terkait: TST-03 (sisi unggah), TST-08, TST-09.

#### M4 — Unduh Aman dan Template Excel

| Aspek | Isi |
|---|---|
| Tujuan | File hanya dapat diunduh oleh yang berhak; reporter dapat memperoleh template resmi. |
| Tabel | `reports`. |
| Kebutuhan terkait | FR-REP-04, FR-REP-08, FR-ADM-11, FR-ADM-15, FILE-07. |
| Keluaran | Mekanisme unduh laporan (signed URL berumur pendek atau stream dari server) dengan pemeriksaan hak akses; penyediaan dan unduhan template Excel resmi. |
| Halaman/endpoint (indikatif) | `GET /api/reports/:id/download`; unduhan template untuk reporter; pengelolaan template untuk admin. |
| Keputusan sebelum build | Mekanisme penyediaan template (disarankan yang paling sederhana, tanpa tabel baru); respons akses ditolak (403 atau 404) tanpa membocorkan keberadaan laporan. |

Checklist verifikasi:
- [ ] Server memverifikasi hak akses **sebelum** menerbitkan URL atau mengirim file.
- [ ] Admin dapat mengunduh laporan semua reporter; reporter hanya miliknya.
- [ ] Reporter A tidak dapat mengunduh laporan Reporter B (diuji langsung ke endpoint dengan ID laporan B).
- [ ] Signed URL berumur pendek dan benar-benar kedaluwarsa (diuji).
- [ ] Nama file unduhan disanitasi.
- [ ] Reporter dapat mengunduh template resmi; admin dapat mengelola template.
- [ ] Bucket tetap privat; tidak ada URL publik permanen.
- [ ] Akun nonaktif tidak dapat mengunduh.

Uji terkait: TST-03, TST-12.

#### M5 — Dashboard Admin dan Pemeriksaan Laporan

| Aspek | Isi |
|---|---|
| Tujuan | Admin memantau kelengkapan laporan per periode dan memeriksa laporan. |
| Tabel | `users`, `reports`. |
| Kebutuhan terkait | FR-ADM-02, FR-ADM-03, FR-ADM-04, FR-ADM-09, FR-ADM-10, FR-ADM-12; ketentuan bagian 4.2; UI-03, UI-04. |
| Keluaran | Ringkasan jumlah entitas; jumlah laporan sudah masuk/belum masuk; filter tahun dan semester; daftar laporan per periode; status pemeriksaan; aksi tandai `reviewed`. |
| Halaman/endpoint (indikatif) | Dashboard admin; `GET /api/admin/reports?year=&semester=`; `PATCH /api/admin/reports/:id/review`. |
| Keputusan sebelum build | Definisi "entitas pelapor" pada hitungan (semua reporter atau hanya yang aktif) dan definisi "belum masuk" (reporter terhitung tanpa record laporan pada periode terpilih). Dokumen sumber belum menentukannya. |

Checklist verifikasi:
- [ ] Jumlah entitas pelapor sesuai definisi yang disetujui dan cocok dengan data seed.
- [ ] "Sudah masuk" dan "belum masuk" benar untuk periode terpilih dan konsisten (sudah masuk + belum masuk = total entitas terhitung).
- [ ] Filter tahun dan semester menghasilkan data periode yang benar.
- [ ] Daftar laporan per periode lengkap dan menampilkan status serta waktu unggah.
- [ ] Menandai `reviewed` mengubah status ke `reviewed`, mengisi `reviewed_at`, dan tampil konsisten di sisi admin dan reporter.
- [ ] Reporter tidak dapat mengubah status laporan lewat endpoint langsung.
- [ ] Tidak ada penghitungan keterlambatan otomatis.
- [ ] Indikator status konsisten; loading, empty, dan error state tersedia.
- [ ] Reporter tidak dapat mengakses dashboard.

Uji terkait: TST-04, TST-05 (sisi status laporan), TST-06, TST-07, TST-11.

#### M6 — Tanya Jawab

| Aspek | Isi |
|---|---|
| Tujuan | Reporter bertanya kepada admin dan menerima jawaban. |
| Tabel | `questions`. |
| Kebutuhan terkait | FR-ADM-13, FR-REP-09, FR-REP-10; ketentuan bagian 4.4; NFR-06. |
| Keluaran | Form dan daftar pertanyaan reporter; daftar semua pertanyaan dan form jawab untuk admin. |
| Halaman/endpoint (indikatif) | Halaman tanya jawab reporter dan admin; `POST/GET /api/questions`; `PATCH /api/admin/questions/:id/answer`. |
| Keputusan sebelum build | Batas panjang `subject` dan `question`. |

Checklist verifikasi:
- [ ] Reporter dapat mengirim pertanyaan; `user_id` diambil dari sesi.
- [ ] Batas panjang subjek dan isi divalidasi di server.
- [ ] Reporter hanya melihat pertanyaannya sendiri; pertanyaan reporter lain tidak dapat dibaca atau diubah (uji tambahan turunan SEC-07).
- [ ] Admin melihat semua pertanyaan dan dapat menjawab.
- [ ] Menjawab mengisi `answer`, `answered_by`, `answered_at`, dan status menjadi `answered`.
- [ ] `answered_by` divalidasi di server harus berrole `admin`.
- [ ] Reporter tidak dapat menjawab atau mengubah `answer` lewat endpoint langsung.
- [ ] Jawaban tampil di sisi reporter; status `open`/`answered` konsisten.
- [ ] Konten pertanyaan/jawaban ditampilkan aman (tanpa eksekusi HTML/skrip).

Uji terkait: TST-05, TST-12, serta uji tambahan isolasi pertanyaan antar reporter.

#### M7 — Backup Google Drive

| Aspek | Isi |
|---|---|
| Tujuan | Salinan tambahan file laporan di Google Drive tanpa mengganggu alur utama. |
| Tabel | `backups`. |
| Kebutuhan terkait | FR-ADM-14, BKP-01 sampai BKP-04; ketentuan bagian 4.3; bagian 9. |
| Keluaran | Pencatatan backup `pending`; eksekusi backup; penyimpanan `drive_file_id`, `backed_up_at`, atau `error_message`; tampilan status backup per laporan; aksi retry admin; status jelas bila Drive belum dikonfigurasi. |
| Halaman/endpoint (indikatif) | Kolom/panel status backup pada daftar laporan admin; `POST /api/admin/backups/:id/retry`; endpoint pemicu backup sesuai pola yang disetujui. |
| Keputusan sebelum build | Pola eksekusi di serverless Vercel (BKP-02) beserta trade-off; perlakuan backup saat file laporan diganti (mis. record backup baru) tanpa menambah tabel. |

Checklist verifikasi:
- [ ] Tanpa kredensial Google Drive, aplikasi tetap berjalan dan UI menampilkan status yang jelas (mis. "belum dikonfigurasi").
- [ ] Record backup `pending` dibuat setelah laporan berhasil tersimpan.
- [ ] Status `success` hanya diset setelah Google Drive mengonfirmasi; `drive_file_id` dan `backed_up_at` tersimpan.
- [ ] Jika gagal: status `failed`, `error_message` tersimpan (tanpa kredensial atau data sensitif).
- [ ] Admin dapat melakukan retry pada backup `failed`.
- [ ] Kegagalan backup tidak menghapus atau merusak record dan file laporan utama.
- [ ] Kredensial Google Drive hanya di environment server; tidak ada di bundle frontend.
- [ ] Unggah utama tidak menunggu backup selesai.
- [ ] Tidak bergantung pada proses latar belakang yang tidak dijamin berjalan setelah respons selesai.
- [ ] Reporter tidak dapat melihat atau memicu retry backup.

Uji terkait: TST-10, TST-12.

#### M8 — Dokumentasi, Pengujian Menyeluruh, dan Deployment

| Aspek | Isi |
|---|---|
| Tujuan | Seluruh sistem teruji, terdokumentasi, dan dapat didemonstrasikan di Vercel. |
| Tabel | Semua. |
| Kebutuhan terkait | Bagian 12 (TST-01 sampai TST-12), bagian 14, Tahap 5 dan 6, NFR-04, NFR-05, NFR-07. |
| Keluaran | Seluruh dokumen bagian 14; hasil pengujian lengkap; panduan konfigurasi Vercel, database, storage; panduan seed dummy. |
| Keputusan sebelum build | Detail konfigurasi deployment yang berdampak biaya atau keamanan. |

Checklist verifikasi:
- [ ] TST-01 sampai TST-12 dijalankan dan hasilnya dilaporkan **jujur** (lulus/gagal/belum dijalankan).
- [ ] Pemeriksaan TypeScript, lint, dan migration dijalankan; hasil dilaporkan.
- [ ] Petunjuk menjalankan pengujian secara lokal tersedia.
- [ ] `README`, instalasi lokal, konfigurasi DB/migration, Supabase Storage, autentikasi, deployment Vercel, integrasi Google Drive (opsional), ERD, data dictionary, dan daftar endpoint tersedia.
- [ ] Daftar endpoint memuat autentikasi, role, input, dan output.
- [ ] Environment variables Vercel terdokumentasi; tidak ada secret di Git (termasuk riwayat commit).
- [ ] Aplikasi berjalan tanpa integrasi Google Drive.
- [ ] Data seed berlabel dummy; tidak ada data pribadi atau laporan asli.
- [ ] Deploy demonstrasi berjalan.
- [ ] Masalah yang belum terselesaikan didokumentasikan.

### 18.5 Format Laporan Modul (wajib saat penyerahan)

```markdown
## Laporan Modul Mx — <nama modul>

**Status:** 📐 rancangan | 🔧 dalam pengerjaan | ⚠️ diimplementasikan, belum diuji lengkap | ✅ selesai
**Kebutuhan terpenuhi:** <daftar ID, mis. FR-ADM-05, FR-ADM-06>
**Kebutuhan belum terpenuhi / ditunda:** <daftar ID + alasan>

### Yang dibangun
- <ringkas, termasuk file/folder utama>

### Keputusan teknis dan alasannya
- <ringkas; sebutkan trade-off bila ada dua pendekatan>

### Checklist verifikasi
- [x] / [ ] <salin checklist modul dan tandai jujur>

### Hasil pengujian
| ID uji | Dijalankan? | Hasil | Catatan |
|---|---|---|---|

### Perubahan skema / dependensi baru
- <kosong bila tidak ada; jika ada, harus sudah disetujui>

### Dampak ke modul lain / regresi
- <modul terdampak dan hasil uji ulang>

### Masalah terbuka dan risiko
- <jujur>

### Persetujuan yang diminta dari pemilik proyek
- <daftar keputusan>
```

### 18.6 Matriks keterlacakan (kebutuhan → modul)

| Kelompok kebutuhan | Modul utama | Diverifikasi juga di |
|---|---|---|
| ARC-01 sampai ARC-09 | M0 | M8 |
| DB-01 sampai DB-07 | M0 | M8 |
| SEC-13 (bootstrap admin) | M0 | M1 |
| SEC-01 sampai SEC-06, SEC-09 sampai SEC-12, SEC-14, SEC-15 | M1 | semua modul yang punya endpoint |
| SEC-07, SEC-08 (akses per pemilik dan admin) | M1 (helper otorisasi) | M2, M3, M4, M5, M6, M7 |
| FR-ADM-01, FR-REP-01 | M1 | |
| FR-ADM-05, FR-ADM-06, FR-ADM-07, FR-ADM-08, FR-REP-02 | M2 | |
| FR-REP-03, FR-REP-05, FR-REP-06, FR-REP-07 | M3 | |
| FILE-01 sampai FILE-06, FILE-08 sampai FILE-11 | M3 | M8 |
| FR-REP-04, FR-REP-08, FR-ADM-11, FR-ADM-15, FILE-07 | M4 | |
| FR-ADM-02, FR-ADM-03, FR-ADM-04, FR-ADM-09, FR-ADM-10, FR-ADM-12 | M5 | |
| FR-ADM-13, FR-REP-09, FR-REP-10 | M6 | |
| FR-ADM-14, BKP-01 sampai BKP-04 | M7 (BKP-01 juga M3) | M8 |
| UI-01 sampai UI-08 | semua modul yang punya tampilan | M8 |
| NFR-01 sampai NFR-04, NFR-07 | M0 | M8 |
| NFR-05 | M7 | M8 |
| NFR-06 | M2, M3, M6 | |
| TST-01, TST-02 | M1 | M2, M8 |
| TST-03 | M3, M4 | M8 |
| TST-04 | M1, M5 | M8 |
| TST-05 | M5, M6 | M8 |
| TST-06, TST-07, TST-11 | M5 | M8 |
| TST-08 | M0 (constraint), M3 (perilaku) | M8 |
| TST-09 | M3 | M8 |
| TST-10 | M7 | M8 |
| TST-12 | semua modul | M8 |

### 18.7 Papan status modul

Legenda: ⬜ belum dimulai · 📐 rancangan diajukan · 🔧 dalam pengerjaan · ⚠️ diimplementasikan, uji belum lengkap · ✅ diimplementasikan, teruji, **disetujui pemilik proyek**.

| Modul | Status | Disetujui pemilik | Catatan |
|---|---|---|---|
| M0 Fondasi dan Konfigurasi | ⬜ | ☐ | |
| M1 Autentikasi dan Otorisasi | ⬜ | ☐ | |
| M2 Manajemen Akun Reporter | ⬜ | ☐ | |
| M3 Pelaporan dan Unggah File | ⬜ | ☐ | |
| M4 Unduh Aman dan Template Excel | ⬜ | ☐ | |
| M5 Dashboard Admin dan Pemeriksaan | ⬜ | ☐ | |
| M6 Tanya Jawab | ⬜ | ☐ | |
| M7 Backup Google Drive | ⬜ | ☐ | |
| M8 Dokumentasi, Pengujian, Deployment | ⬜ | ☐ | |

AI builder WAJIB memperbarui papan ini setiap kali status modul berubah, dan tidak boleh mengubah kolom "Disetujui pemilik" kecuali pemilik proyek menyatakannya.
