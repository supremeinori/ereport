# DESIGN.md — E-Report PBOBA

Arah visual untuk aplikasi pelaporan distribusi obat tradisional PBOT Sumatera Barat.
Dokumen ini adalah sumber kebenaran desain. `antislop` dipakai sebagai filter, bukan sebagai sumber arah.

## Identitas

E-Report PBOBA adalah sistem bagi Pedagang Besar Obat Tradisional (PBOT) mengunggah laporan
semesteran distribusi obat tradisional, dan bagi administrator yang memverifikasi berkas tersebut.
Produk ini adalah **lembar register digital**, bukan aplikasi consumer.

Karakter yang dikehendaki: resmi, tenang, dapat diaudit. Terasa seperti dokumen administrasi
tata usaha, bukan seperti template SaaS.

**Motif identitas**: garis rambut (hairline) sebagai pemisah, angka tabular monospace untuk
setiap kode, berkas, dan periode, serta satu warna aksen ungu untuk satu momen penting saja.
Setiap halaman terbaca seperti satu lembar register: judul, angka, baris.

## Palet

Palet diambil dari berkas logo `ereport_pboba_logo_v2.svg` (botol obat tradisional ungu lavender),
bukan dari palet default library.

| Peran | Token | Nilai | Alasan |
|---|---|---|---|
| Aksen / aksi utama | `purple-700` | `#764b8c` | Warna logo yang diturunkan, kontras 5.9:1 terhadap putih |
| Aksen hover | `purple-800` | `#5c386e` | deepened state, bukan warna baru |
| Merek gelap | `purple-950` | `#2b1635` | Palet aubergine dalam, untuk pita header aplikasi |
| Permukaan | `surface` | `#ffffff` | Kartu, panel, tabel |
| Latar | `canvas` | `#f6f4f8` | Kertas, sedikit hangat ke ungu |
| Garis | `line` | `#e5dfea` | Rambut ungu netral, bukan abu-abu biru |
| Teks | `ink` | `#1f1a24` | Hampir hitam, kehangatan ungu |
| Teks sekunder | `ink-soft` | `#5c5468` | Label, keterangan |

Token `purple-*`, `indigo-*`, dan `violet-*` pada `globals.css` adalah satu ramp yang sama
(ungu dusty lilac). Alias `indigo` dan `violet` dipertahankan agar markup lama tidak
memasukkan biru atau merah muda yang tidak ada dalam identitas.

Warna status bersifat fungsional, bukan dekorasi: hijau (berkas disetujui / akun aktif),
kuning (menunggu pemeriksaan / dalam antrean), merah (perlu revisi / gagal).
Warna ini hanya muncul pada badge status, angka, dan bilah progres.

## Tipografi

- **Sans: Plus Jakarta Sans.** Huruf yang dirancang untuk identitas kota Jakarta dan dipakai
  pada sistem administrasi resmi Indonesia. Dipilih karena produk ini adalah sistem
  administrasi Indonesia, bukan produk teknologi umum.
- **Mono: IBM Plex Mono.** Untuk username, identifier, nama berkas, dan periode laporan.
  Karakter registrasinya cocok dengan dokumen resmi, dan hanya dipakai pada data yang
  benar-benar berupa kode.
- Tidak ada huruf kapital dengan letter-spacing lebar sebagai gaya. Label memakai
  sentence case dengan weight 500/600.

Skala mikro (`text-2xs` 11px, `text-3xs` 10px) sengaja ada untuk keterangan angka, catatan di
bawah tabel, dan nama berkas, yang membedakan data, bukan untuk membuat judul kecil.
Header tabel memakai `text-xs` 12px dengan weight 600 dan sentence case, supaya label kolom
terbaca sebagai nama kolom, bukan sebagai pita dekoratif.

## Radius

| Elemen | Radius | Alasan |
|---|---|---|
| Tombol, input, select | `rounded-md` (6px) | Bentuk kerja, bukan dekorasi |
| Panel, kartu, tabel | `rounded-lg` (8px) | Wadah konten |
| Badge status | `rounded-sm` (4px) | Label, harus terbaca sebagai data, bukan sebagai hiasan |

Tidak ada bentuk pil. Tidak ada `rounded-full` pada tombol, input, atau panel.

## Elevasi

Hampir semua permukaan rata. Border rambut + `shadow-panel` pada panel. Shadow yang lebih
besar hanya pada modal (`shadow-modal`, satu lapis di atas halaman).
Tidak ada shadow berwarna ungu. Tidak ada glow.

## Gerak

MOTION 1. Hanya hover, focus, dan transisi warna 150ms.
Tidak ada pulse, tidak ada float, tidak ada loop, tidak ada animasi masuk halaman.
Poin data yang tidak berubah tidak perlu bergerak.

## Dial

ENERGY 2 / RHYTHM 2 / MOTION 1.

ENERGY 2: tegas dan jelas, bukan ramai, tidak norak.
RHYTHM 2: komposisi bervariasi antar halaman, strip ledger, panel tugas, dan tabel
berubah bentuk, bukan satu template kartu berulang.
MOTION 1: hover dan focus saja.

## Pola yang dihindari di produk ini

- Gradien ungu-biru sebagai warna utama. Gradien hanya dipakai pada logo.
- Efek kaca (blur) pada navbar, kartu, modal, atau sidebar.
- Badge pil di atas judul yang mengulang isi judul.
- Ikon selalu SVG dan digambar relevan dengan konten.
- Panah dekoratif di tombol.
- Titik status yang berdenyut tanpa keadaan nyata.
- Angka, nama, atau data contoh yang tampak realistis tetapi fiktif. Placeholder harus jujur
  (`nama@entitas.co.id`, `Nama Badan Usaha`), bukan `PT Herbal Mandiri Sejahtera`.
- Baris tabel dengan tombol tiga titik yang tidak melakukan apa pun.

## Alur pelaporan (konten nyata, bukan template)

Tiga langkah memang terjadi pada produk ini, dan hanya tiga:

1. Entitas PBOT mengunggah berkas `.xlsx` periode semester.
2. Administrator membuka isi berkas di dalam sistem dan memeriksa kelengkapannya.
3. Status laporan diperbarui menjadi "Sudah Diperiksa" (atau dikembalikan untuk revisi).

Langkah ini digambarkan sebagai daftar bernomor biasa, bukan lingkaran ikon.
