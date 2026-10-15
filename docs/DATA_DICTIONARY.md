# Data Dictionary — E-Report PBOBA

Dokumen kamus data lengkap untuk 4 tabel inti sistem E-Report PBOBA sesuai kebutuhan SRS Bagian 4 dan DB-07.

---

## 1. Tabel: `users`
Menyimpan akun administrator dan entitas pelapor (PBOT).

| Nama Kolom | Tipe Data | Nullable | Default | Keterangan & Aturan Bisnis |
|---|---|---|---|---|
| `id` | UUID | Tidak | `gen_random_uuid()` | Primary Key unik. |
| `identifier` | TEXT | Tidak | - | Kode unik entitas/pengguna (mis. `PBOT-001`, `ADMIN-01`). Unik. |
| `name` | TEXT | Tidak | - | Nama lengkap pengguna atau badan usaha PBOT. |
| `email` | TEXT | Tidak | - | Alamat email resmi untuk login. Unik. |
| `password_hash` | TEXT | Tidak | - | Hash kata sandi menggunakan bcrypt/Argon2id. Tidak pernah dikirim di respons API. |
| `role` | ENUM(`admin`, `reporter`) | Tidak | - | Peran pengguna dalam otorisasi sistem. |
| `is_active` | BOOLEAN | Tidak | `true` | Status keaktifan akun. Akun nonaktif dicabut hak aksesnya langsung. |
| `created_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembuatan akun (UTC). |
| `updated_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembaruan akun (UTC). |

---

## 2. Tabel: `reports`
Menyimpan metadata dan status laporan semesteran distribusi obat tradisional.

| Nama Kolom | Tipe Data | Nullable | Default | Keterangan & Aturan Bisnis |
|---|---|---|---|---|
| `id` | UUID | Tidak | `gen_random_uuid()` | Primary Key unik. |
| `user_id` | UUID | Tidak | - | Foreign Key ke `users.id` (`ON DELETE RESTRICT`). |
| `period_year` | INTEGER | Tidak | - | Tahun pelaporan (mis. 2026). |
| `period_semester` | SMALLINT | Tidak | - | Semester pelaporan: hanya nilai `1` atau `2` (`CHECK`). |
| `file_path` | TEXT | Tidak | - | Object key acak berbasis UUID pada Supabase Storage privat. |
| `original_filename` | TEXT | Tidak | - | Nama asli berkas Excel saat diunggah oleh reporter. |
| `uploaded_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu unggah laporan (UTC). |
| `status` | ENUM(`pending_review`, `reviewed`, `revision_required`) | Tidak | `pending_review` | Status verifikasi laporan oleh admin. |
| `reviewed_at` | TIMESTAMPTZ | Ya | `NULL` | Waktu saat admin menandai laporan sebagai `reviewed`. |
| `created_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembuatan record (UTC). |
| `updated_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembaruan record (UTC). |

**Batasan & Indeks:**
- `UNIQUE (user_id, period_year, period_semester)`
- `INDEX (period_year, period_semester)`
- `INDEX (user_id)`

---

## 3. Tabel: `backups`
Mencatat riwayat pencadangan berkas laporan ke Google Drive.

| Nama Kolom | Tipe Data | Nullable | Default | Keterangan & Aturan Bisnis |
|---|---|---|---|---|
| `id` | UUID | Tidak | `gen_random_uuid()` | Primary Key unik. |
| `report_id` | UUID | Tidak | - | Foreign Key ke `reports.id` (`ON DELETE RESTRICT`). |
| `provider` | TEXT | Tidak | `'google_drive'` | Nama penyedia pencadangan sekunder. |
| `drive_file_id` | TEXT | Ya | `NULL` | File ID Google Drive setelah berhasil dicadangkan. |
| `backup_status` | ENUM(`pending`, `success`, `failed`) | Tidak | `pending` | Status proses pencadangan. |
| `backed_up_at` | TIMESTAMPTZ | Ya | `NULL` | Waktu pencadangan berhasil dikonfirmasi Google Drive. |
| `error_message` | TEXT | Ya | `NULL` | Pesan error bila gagal (tanpa kredensial/rahasia). |
| `created_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembuatan record (UTC). |
| `updated_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembaruan record (UTC). |

**Batasan & Indeks:**
- `INDEX (report_id)`

---

## 4. Tabel: `questions`
Mencatat tanya jawab sederhana antara entitas pelapor (reporter) dan administrator.

| Nama Kolom | Tipe Data | Nullable | Default | Keterangan & Aturan Bisnis |
|---|---|---|---|---|
| `id` | UUID | Tidak | `gen_random_uuid()` | Primary Key unik. |
| `user_id` | UUID | Tidak | - | Foreign Key penanya ke `users.id` (`ON DELETE RESTRICT`). |
| `subject` | TEXT | Tidak | - | Judul atau perihal pertanyaan (maks 255 karakter). |
| `question` | TEXT | Tidak | - | Isi lengkap pertanyaan reporter. |
| `answer` | TEXT | Ya | `NULL` | Tanggapan / jawaban dari administrator. |
| `answered_by` | UUID | Ya | `NULL` | Foreign Key admin penjawab ke `users.id` (`ON DELETE RESTRICT`). |
| `status` | ENUM(`open`, `answered`) | Tidak | `open` | Status pertanyaan. |
| `created_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pertanyaan diajukan (UTC). |
| `answered_at` | TIMESTAMPTZ | Ya | `NULL` | Waktu saat pertanyaan dijawab admin (UTC). |
| `updated_at` | TIMESTAMPTZ | Tidak | `now()` | Waktu pembaruan record (UTC). |

**Batasan & Indeks:**
- `INDEX (user_id)`
- `INDEX (status)`
