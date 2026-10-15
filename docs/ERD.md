# Entity Relationship Diagram (ERD) — E-Report PBOBA

Dokumen ini memetakan 4 tabel inti sistem E-Report PBOBA sesuai kebutuhan SRS Bagian 4.

```mermaid
erDiagram
    users ||--o{ reports : "mengunggah (1 to N)"
    users ||--o{ questions : "bertanya (1 to N)"
    users ||--o{ questions : "menjawab (1 to N)"
    reports ||--o{ backups : "mempunyai backup (1 to N)"

    users {
        uuid id PK
        text identifier UK "Kode unik entitas / pengguna"
        text name "Nama pengguna atau badan usaha"
        text email UK "Alamat email"
        text password_hash "Hash password (Argon2id/bcrypt)"
        enum role "admin, reporter"
        boolean is_active "Status aktif akun"
        timestamptz created_at "Waktu pembuatan"
        timestamptz updated_at "Waktu pembaruan"
    }

    reports {
        uuid id PK
        uuid user_id FK "Relasi ke users.id (RESTRICT)"
        int period_year "Tahun pelaporan (mis. 2026)"
        smallint period_semester "Semester pelaporan (1 atau 2)"
        text file_path "Object key di Supabase Storage"
        text original_filename "Nama file asli saat diunggah"
        timestamptz uploaded_at "Waktu unggah"
        enum status "pending_review, reviewed, revision_required"
        timestamptz reviewed_at "Waktu diperiksa admin"
        timestamptz created_at "Waktu pembuatan"
        timestamptz updated_at "Waktu pembaruan"
    }

    backups {
        uuid id PK
        uuid report_id FK "Relasi ke reports.id (RESTRICT)"
        text provider "Penyedia backup ('google_drive')"
        text drive_file_id "ID berkas Google Drive"
        enum backup_status "pending, success, failed"
        timestamptz backed_up_at "Waktu backup berhasil"
        text error_message "Pesan error jika gagal"
        timestamptz created_at "Waktu pembuatan"
        timestamptz updated_at "Waktu pembaruan"
    }

    questions {
        uuid id PK
        uuid user_id FK "Penanya (users.id) (RESTRICT)"
        text subject "Subjek pertanyaan"
        text question "Isi pertanyaan"
        text answer "Jawaban admin"
        uuid answered_by FK "Penjawab admin (users.id) (RESTRICT)"
        enum status "open, answered"
        timestamptz created_at "Waktu pertanyaan dibuat"
        timestamptz answered_at "Waktu dijawab"
        timestamptz updated_at "Waktu pembaruan"
    }
```

## Aturan Integritas Data
1. **Batas Model Data**: Tepat 4 tabel di atas. Tidak ada tabel kelima.
2. **Aturan Foreign Key**: Semua foreign key menggunakan `ON DELETE RESTRICT` eksplisit guna mencegah penghapusan kaskade data pelaporan penting.
3. **Unique Constraint**: Kombinasi `(user_id, period_year, period_semester)` pada tabel `reports` bersifat unik (satu laporan per periode untuk tiap entitas pelapor).
4. **Check Constraint**: Nilai `period_semester` dibatasi hanya 1 atau 2.
5. **Indeks Minimal**:
   - `reports(period_year, period_semester)`
   - `reports(user_id)`
   - `questions(user_id)`
   - `questions(status)`
   - `backups(report_id)`
