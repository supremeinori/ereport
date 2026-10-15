# Panduan Deployment E-Report PBOBA ke Vercel & Supabase

Dokumen ini memuat langkah-langkah resmi deployment aplikasi E-Report PBOBA ke platform **Vercel** dan **Supabase**.

---

## 1. Persiapan Database (Supabase PostgreSQL)

Aplikasi menggunakan **tepat 4 tabel** pada schema database publik:
1. `users`
2. `reports`
3. `backups`
4. `questions`

### Menjalankan Migrasi ke Supabase:
Di komputer lokal atau CI/CD, jalankan:
```bash
# Pastikan DIRECT_URL dan DATABASE_URL telah dikonfigurasi di file .env
npx prisma migrate deploy
```

Untuk menginisiasi akun administrator pertama kali secara idempoten:
```bash
npm run bootstrap:admin
```

---

## 2. Persiapan Supabase Storage (Private Bucket)

1. Buka dashboard Supabase: **Storage** -> **New Bucket**.
2. Berikan nama bucket: `pboba-reports`.
3. **Penting**: Pastikan toggle **"Public bucket"** dalam kondisi **OFF** (Private).
4. Buat RLS (Row Level Security) atau biarkan backend mengakses berkas secara eksklusif menggunakan `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Konfigurasi Environment Variables di Vercel

Pada dashboard proyek Vercel (**Settings** -> **Environment Variables**), tambahkan variabel berikut:

| Nama Variabel | Keterangan | Contoh Nilai |
|---|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler (Port 6543) dengan pgbouncer | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Connection (Port 5432) untuk migrasi | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` |
| `SESSION_SECRET` | Kunci rahasia HMAC SHA-256 (minimal 32 karakter acak) | `d8f2a1b9e7c4f6a3e5b8d0c2a4f6e8b1d9c7a5f3e1b7d5c9a3f1e7b5d3c1a9f5` |
| `ADMIN_EMAIL` | Email akun bootstrap administrator | `admin@pboba-sumbar.go.id` |
| `ADMIN_PASSWORD` | Password akun bootstrap administrator | `AdminPbobaSumbar2026!#` |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint REST Supabase | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (wajib untuk akses private storage) | `eyJhbGciOi...` |
| `SUPABASE_STORAGE_BUCKET` | Nama bucket privat laporan | `pboba-reports` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | *(Opsional)* Email Google Service Account | `backup@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | *(Opsional)* Private key RSA Google Service Account | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `GOOGLE_DRIVE_FOLDER_ID` | *(Opsional)* ID Folder Google Drive penerima cadangan | `1a2b3c4d5e6f...` |

> [!NOTE]
> Aplikasi dirancang untuk beroperasi secara penuh (100% fungsional) **meskipun integrasi Google Drive belum dikonfigurasi** (BKP-04).

---

## 4. Build & Deployment

1. Hubungkan repository GitHub: `https://github.com/supremeinori/ereport` ke Vercel.
2. Pilih Framework Preset: **Next.js**.
3. Build Command: `npm run build` (atau `next build`).
4. Output Directory: `.next`.
5. Klik **Deploy**.

---

## 5. Verifikasi Operasional Pasca Deployment

1. Buka URL domain Vercel.
2. Lakukan login Administrator menggunakan kredensial `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
3. Buka menu **Kelola Akun Reporter**, buat satu entitas PBOT uji.
4. Lakukan logout, kemudian login sebagai reporter yang baru dibuat.
5. Unduh berkas **Template Excel Resmi**.
6. Unggah laporan semester pada halaman **Pelaporan Semester**.
7. Login kembali sebagai Administrator, periksa laporan di menu **Pemeriksaan Laporan**, unduh berkas untuk memverifikasi signed URL, dan tandai laporan sebagai **"Sudah Diperiksa"**.
