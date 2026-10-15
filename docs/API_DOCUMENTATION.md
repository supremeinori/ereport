# Dokumentasi API E-Report PBOBA Sumatera Barat

Seluruh endpoint API menerapkan arsitektur RESTful dengan otorisasi berbasis sesi cookie bertanda tangan HMAC SHA-256 (`ereport_session`).

---

## 1. Autentikasi (`/api/auth`)

### `POST /api/auth/login`
- **Akses**: Publik
- **Tujuan**: Autentikasi pengguna (Admin & Reporter)
- **Rate Limit**: 5 percobaan per 15 menit per IP (SEC-12)
- **Request Body**:
  ```json
  {
    "email": "user@pboba.id",
    "password": "PasswordRahasia123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "name": "PT Sumber Sehat Tradisional",
      "email": "user@pboba.id",
      "identifier": "PBOT-SUMBAR-001",
      "role": "reporter",
      "is_active": true
    }
  }
  ```
- **Error Codes**: `400` (input kosong), `401` (kredensial salah / akun nonaktif), `429` (rate limit).

### `POST /api/auth/logout`
- **Akses**: Terautentikasi (Admin / Reporter)
- **Tujuan**: Menghapus cookie sesi `ereport_session`.
- **Response `200 OK`**: `{ "success": true, "message": "Berhasil logout." }`

### `GET /api/auth/me`
- **Akses**: Terautentikasi (Admin / Reporter)
- **Tujuan**: Memeriksa identitas sesi aktif dan status keaktifan di database.
- **Response `200 OK`**: Profil pengguna yang sedang login.

---

## 2. Manajemen Akun Reporter (`/api/admin/reporters`)

### `GET /api/admin/reporters`
- **Akses**: Khusus `admin`
- **Query Params**: `?q=pencarian` (opsional: mencari berdasarkan nama atau identifier)
- **Response `200 OK`**:
  ```json
  {
    "reporters": [
      {
        "id": "uuid",
        "name": "PT Berkah Herbal Minang",
        "identifier": "PBOT-SUMBAR-002",
        "email": "kontak@berkahherbal.co.id",
        "is_active": true,
        "created_at": "2026-10-15T10:00:00Z"
      }
    ]
  }
  ```

### `POST /api/admin/reporters`
- **Akses**: Khusus `admin`
- **Tujuan**: Membuat akun entitas pelapor baru (role terkunci menjadi `reporter`).
- **Request Body**:
  ```json
  {
    "name": "PT Alami Jamu Padang",
    "email": "admin@alamijamu.co.id",
    "identifier": "PBOT-SUMBAR-003",
    "password": "PasswordAwalPBOT2026!#"
  }
  ```
- **Response `201 Created`**: Profil reporter yang dibuat.
- **Error Codes**: `400` (duplikasi email/identifier, input tidak lengkap).

### `PATCH /api/admin/reporters/[id]/active`
- **Akses**: Khusus `admin`
- **Tujuan**: Mengaktifkan atau menonaktifkan akun pelapor (dengan konfirmasi).
- **Request Body**:
  ```json
  {
    "is_active": false
  }
  ```
- **Response `200 OK`**: Data pengguna yang diperbarui. Sesi akun yang dinonaktifkan langsung dicabut pada request berikutnya.

---

## 3. Pelaporan & Unduh Berkas (`/api/reporter/reports` & `/api/reports`)

### `GET /api/reporter/reports`
- **Akses**: Khusus `reporter`
- **Tujuan**: Mengambil seluruh riwayat laporan milik entitas yang sedang login.
- **Response `200 OK`**: Daftar laporan terurut dari yang terbaru.

### `POST /api/reporter/reports/upload`
- **Akses**: Khusus `reporter`
- **Tujuan**: Mengunggah berkas laporan semester baru (`multipart/form-data`).
- **Form Data**:
  - `year`: number (mis. 2026)
  - `semester`: number (1 atau 2)
  - `file`: binary `.xlsx` (maks 10 MB, magic bytes ZIP terverifikasi, bukan macro).
- **Aturan Penggantian Berkas**:
  - Jika laporan pada periode tersebut sudah ada, berkas baru diunggah ke storage terlebih dahulu sebelum berkas lama dihapus secara aman (safe replacement).
  - Status laporan diset/kembali ke `pending_review`.
  - Record backup baru dibuat dengan status `pending`.
- **Response `200 OK`**: Metadata laporan yang tersimpan.

### `GET /api/reports/[id]/download`
- **Akses**: `admin` (semua laporan) atau `reporter` (hanya laporan miliknya sendiri).
- **Isolasi Keamanan (TST-03)**: Jika reporter mencoba mengakses ID laporan milik entitas lain, server mengembalikan `404 Not Found` (mencegah kebocoran informasi).
- **Response `200 OK`**:
  ```json
  {
    "url": "https://<supabase-storage-signed-url>",
    "filename": "Laporan_Distribusi_Sem1_2026.xlsx",
    "expires_in_seconds": 60
  }
  ```

---

## 4. Pengelolaan Template Excel Resmi (`/api/template/download`)

### `GET /api/template/download`
- **Akses**: Terautentikasi (`admin` & `reporter`)
- **Tujuan**: Mengunduh berkas template laporan resmi berumur 300 detik.
- **Response `200 OK`**: Signed download URL template.

### `PUT /api/template/download`
- **Akses**: Khusus `admin`
- **Tujuan**: Mengunggah versi terbaru dari template resmi (`.xlsx`).

---

## 5. Pemeriksaan Laporan Admin (`/api/admin/reports`)

### `GET /api/admin/reports`
- **Akses**: Khusus `admin`
- **Query Params**: `?year=2026&semester=1` (default: periode berjalan)
- **Response `200 OK`**:
  ```json
  {
    "period": { "year": 2026, "semester": 1 },
    "summary": {
      "total_reporters": 12,
      "submitted_count": 8,
      "reviewed_count": 5,
      "pending_review_count": 3,
      "unsubmitted_count": 4
    },
    "reports": [ ... ],
    "unsubmitted_reporters": [ ... ]
  }
  ```

### `PATCH /api/admin/reports/[id]/review`
- **Akses**: Khusus `admin`
- **Tujuan**: Menandai laporan menjadi `reviewed` dan mencatat `reviewed_at`.

---

## 6. Layanan Tanya Jawab (`/api/questions`)

### `GET /api/questions`
- **Akses**:
  - `reporter`: Hanya mengembalikan pertanyaan miliknya sendiri.
  - `admin`: Mengembalikan seluruh pertanyaan (`?status=all|open|answered`).

### `POST /api/questions`
- **Akses**: Khusus `reporter`
- **Request Body**:
  ```json
  {
    "subject": "Format pelaporan sediaan kapsul",
    "question": "Apakah sediaan kapsul herbal dicatat pada sheet yang sama?"
  }
  ```

### `PATCH /api/admin/questions/[id]/answer`
- **Akses**: Khusus `admin`
- **Request Body**:
  ```json
  {
    "answer": "Ya, seluruh sediaan padat kapsul dicatat pada Sheet 1."
  }
  ```

---

## 7. Cadangan Google Drive (`/api/admin/backups`)

### `GET /api/admin/backups`
- **Akses**: Khusus `admin`
- **Query Params**: `?status=all|pending|success|failed`
- **Response `200 OK`**: Status konfigurasi integrasi Google Drive, ringkasan jumlah, dan daftar riwayat arsip cadangan.

### `POST /api/admin/backups/[id]/retry`
- **Akses**: Khusus `admin`
- **Tujuan**: Memicu eksekusi ulang cadangan untuk record yang berstatus `failed` atau `pending`.
