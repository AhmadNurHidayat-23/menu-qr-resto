# Menu QR Resto

Pemesanan makanan melalui QR meja. Dibuat dengan identitas restoran **Ruang Rasa**, antarmuka bahasa Indonesia, dan alur pelanggan hingga dapur yang tersimpan di database.

## Fitur

- Landing page, pencarian, kategori, foto menu, dan keranjang per meja.
- QR SVG unik untuk setiap meja, dapat diunduh dari area petugas.
- Checkout tanpa akun; harga dihitung server, stok dikurangi secara atomik, dan pengiriman berulang tidak menggandakan pesanan.
- Tautan pelacakan pribadi dengan pembaruan otomatis setiap 5 detik.
- Antrean dapur: diterima → diproses → siap → selesai.
- Konfirmasi pembayaran manual dengan jejak aktivitas petugas; pesanan selesai harus sudah lunas.
- Pengelolaan foto, harga, stok, kategori, arsip menu, dan aktivasi meja.
- Riwayat, filter tanggal/status/pelanggan, ringkasan penjualan, dan ekspor CSV.
- Login petugas, CSRF, pembatasan permintaan, validasi unggahan, dan halaman kesalahan.

## Teknologi

Laravel 13, PHP 8.3+, React 19, TypeScript, Inertia.js 3, Tailwind CSS 4, Vite 7, SQLite, PHPUnit, dan Playwright. Versi aktual dikunci pada `composer.lock` dan `package-lock.json`. Node.js 22.12+ disarankan.

## Instalasi

Jalankan dari folder proyek menggunakan PHP, Composer, dan Node.js yang sudah tersedia:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File -Path database/database.sqlite -ErrorAction SilentlyContinue
php artisan migrate --seed
php artisan storage:link
npm ci
npm run build
php artisan staff:create
php artisan serve --host=127.0.0.1 --port=8011
```

Buka `http://127.0.0.1:8011`. Login petugas di `/petugas/masuk`. Perintah `staff:create` meminta nama, email, dan kata sandi minimal 12 karakter; tidak tersedia akun atau kata sandi bawaan. Seeder hanya menambahkan enam menu contoh dan delapan meja, tanpa transaksi atau penjualan fiktif.

Untuk pengembangan frontend, jalankan `npm run dev` di terminal terpisah. SQLite berada di `database/database.sqlite`, khusus proyek ini. Untuk MySQL, buat database baru khusus aplikasi dan sesuaikan `DB_*` sebelum migrasi.

## QR dan penggunaan ponsel

Atur `APP_URL` di `.env` ke alamat restoran yang benar-benar dapat diakses ponsel, misalnya alamat IP LAN komputer dan port `8011`. Jalankan server dengan `--host=0.0.0.0` hanya jika diperlukan untuk jaringan lokal. Komputer dan ponsel harus berada pada jaringan yang sesuai dan port diizinkan firewall.

Masuk sebagai petugas → **Menu & meja → Meja & QR** → unduh dan cetak QR. QR mengikuti `APP_URL`; unduh ulang setelah alamat berubah. Pengunjung halaman utama hanya menelusuri katalog. Pemesanan membutuhkan tautan QR meja aktif. QR meja bukan bukti keberadaan fisik pelanggan; staf tetap perlu memeriksa pesanan yang masuk.

Pembayaran selalu dilakukan langsung kepada petugas. Aplikasi mencatat konfirmasi manual dan tidak mengintegrasikan bank maupun payment gateway. Tautan pesanan menggunakan token acak; perlakukan tautan tersebut sebagai akses pribadi ke rincian pesanan.

## Pengujian

```powershell
php artisan route:list --except-vendor
php artisan test
npm run build
npm run test:e2e
```

`php artisan test` memakai SQLite dalam memori. Pengujian mencakup harga server, rollback stok, pengiriman berulang, validasi, akses petugas, status, pembayaran, unggahan, dan laporan.

Pengujian browser memakai Microsoft Edge yang sudah terpasang, port `8012`, akun sementara dengan kata sandi acak, dan `database/.browser-test.sqlite` yang dibuat ulang khusus pengujian. Tidak menyentuh database aplikasi. Screenshot dan trace hanya tersimpan di `test-results/` yang diabaikan Git. Jika Edge tidak tersedia, sesuaikan `channel` di `playwright.config.ts` dengan browser yang sudah ada.

Browser menguji pemesanan hingga selesai, decoding QR ke URL meja, pengelolaan menu/meja, ekspor laporan, pencarian, serta viewport desktop/tablet/ponsel. Pengujian viewport bukan pengujian perangkat fisik.

## Catatan operasional

- Gunakan HTTPS, `APP_DEBUG=false`, dan alamat `APP_URL` yang benar untuk penggunaan produksi; arahkan document root ke `public/`.
- Hanya buat akun petugas yang dipercaya. Tidak ada registrasi publik.
- Simpan cadangan database dan `storage/app/public`; keduanya tidak masuk Git.
- Stok adalah jumlah porsi yang dapat dijual. Menu dapat diarsipkan agar riwayat harga tetap utuh.
- Penjualan selesai menghitung pesanan selesai yang lunas. Pembayaran diterima juga mencakup pesanan lunas yang masih dikerjakan; tanggal filter berdasarkan waktu pemesanan.
- Foto ilustrasi menu/interior dari [Unsplash](https://unsplash.com), disimpan lokal agar katalog tidak bergantung pada layanan gambar saat dijalankan. Ganti dengan foto restoran sebelum pemakaian bisnis. Sumber foto tercantum pada `public/images/SOURCES.md`.

Kode aplikasi dipecah menjadi berkas maksimal 300 baris. Tidak ada kredensial, database, hasil build, atau screenshot yang disertakan ke repository.
