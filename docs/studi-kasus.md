# Latar Belakang
PT Maju Bersama Digital adalah perusahaan distribusi barang elektronik yang memiliki 5 gudang di beberapa kota besar di Indonesia(Jakarta, Surabaya, Bandung, Medan, dan Makassar). Saat ini perusahaan mengalami permasalahan serius dalam pengelolaan inventaris:
1. Pencatatan stok masih dilakukan secara manual menggunakan spreadsheet sehingga sering terjadi ketidaksesuaian data
2. Proses transfer barang antar gudang memakan waktu lama karena koordinasi via telepon dan email
3. Pelaporan stok membutuhkan waktu 2–3 hari karena harus mengompilasi data dari berbagai sumber
4. Tidak ada sistem peringatan ketika stok menipis, sehingga sering terjadi kehabisan stok produk yang sedang tinggi permintaannya
5. Manajemen kesulitan memantau performa inventaris secara real-time untuk pengambilan keputusan

Manajemen PT Maju Bersama Digital memutuskan untuk membangun sebuah website Sistem Manajemen Inventaris bernama "SmartStock Pro" untuk menyelesaikan permasalahan di atas.

# Deskripsi Sistem yang Dibangun
Peserta diminta untuk membangun website "SmartStock Pro" yang merupakan Sistem Manajemen Inventaris berbasis web dengan fitur-fitur yang mencakup seluruh unit kompetensi yang diujikan. Website harus dapat diakses oleh berbagai peran pengguna dan mampu mengelola data inventaris secara real-time.

# Kebutuhan Fungsional
## Modul 1: Autentikasi dan Keamanan
a. Sistem login dengan autentikasi multi-level (Admin, Manajer Gudang, Staf Gudang, Viewer)
b. Implementasi password hashing (bcrypt/argon2) dan validasi kekuatan password
c. Proteksi terhadap serangan SQL Injection, XSS, dan CSRF
d. Sistem session management dengan timeout otomatis
e. Audit log untuk mencatat seluruh aktivitas pengguna (siapa, kapan, melakukan apa)
f. Dokumen analisis risiko keamanan informasi beserta langkah mitigasi

## Modul 2: Dashboard dan Real-Time Monitoring
a. Dashboard utama dengan grafik dan chart interaktif menampilkan ringkasan stok, tren barang masuk/keluar, dan nilai inventaris
b. Real-time notification menggunakan fitur pilihan anda ketika ada perubahan stok kritis
c. Galeri produk dengan fitur upload dan preview gambar (multimedia)
d. Peta lokasi gudang interaktif menggunakan integrasi peta (Leaflet/Google Maps)
e. Panel monitoring resource server (CPU usage, memory, response time) yang diperbarui secara otomatis
f. Export laporan dalam format PDF dengan elemen visual (logo, grafik, tabel berwarna)

## Modul 3: Manajemen Data Inventaris (CRUD + SQL)
a. CRUD lengkap untuk data: Produk, Kategori, Gudang, Supplier, Transaksi Masuk/Keluar
b. Implementasi query SQL.
c. Algoritma pencarian produk.
d. Algoritma perhitungan stok otomatis (FIFO/LIFO)
e. Pagination, sorting, dan filtering data dengan performa optimal

## Modul 4: Sistem Notifikasi dan Alert
a. Alert otomatis ketika stok produk di bawah minimum threshold (email dan/atau in-app notification)
b. Notifikasi error/exception pada aplikasi yang dikirim ke admin
c. Monitoring uptime dan alert jika response time melebihi threshold yang ditentukan
d. Dashboard log error dengan kategorisasi severity (critical, warning, info)

## Modul 5: Pemrosesan Paralel dan Transfer Antar Gudang
a. Fitur transfer barang antar gudang dengan pemrosesan paralel sehingga stok di gudang asal dan tujuan diperbarui secara bersamaan tanpa bottleneck
b. Batch import data produk dari file CSV/Excel dengan proses paralel
c. Background job untuk generate laporan besar tanpa mengganggu respons UI
d. Implementasi job queue untuk sinkronisasi data otomatis antar gudang

# Kebutuhan Non-Fungsional

## Arsitektur dan Infrastruktur
a. Peserta wajib menyusun dokumen arsitektur perangkat keras yang menggambarkan topologi server, database server, dan jaringan yang dibutuhkan (dapat berupa diagram)
b. Spesifikasi minimum server: prosesor, RAM, storage, bandwidth yang direkomendasikan 

## Tools dan Framework
a. Peserta wajib menganalisis dan mendokumentasikan pemilihan tools, library, komponen, dan framework yang digunakan beserta alasan pemilihannya
b. Analisis skalabilitas: bagaimana sistem dapat menangani peningkatan jumlah pengguna dan data tanpa degradasi performa signifikan
c. Dokumentasi library/komponen pihak ketiga yang digunakan (versi, lisensi, fungsi) 

## Kebutuhan Migrasi dan Pembaharuan
a. Peserta harus mensimulasikan skenario migrasi dari sistem lama (spreadsheet) ke SmartStock Pro, termasuk: strategi migrasi data, mapping field, validasi data pasca-migrasi, dan rollback plan
b. Menyusun dokumen cutover plan yang mencakup: timeline, checklist pra-cutover, langkah cutover, dan verifikasi pasca-cutover
c. Mensimulasikan skenario pembaharuan (update) perangkat lunak: menambahkan fitur baru tanpa mengganggu fitur yang sudah berjalan, termasuk penggunaan version control (Git)
d. Menyusun analisis dampak perubahan (impact analysis) terhadap modul-modul lain jika terjadi perubahan pada salah satu fitur

## Dokumentasi Teknis untuk Pelanggan
a. Menyusun panduan pengguna (user guide) yang mencakup langkah-langkah penggunaan setiap modul
b. Menyusun FAQ (Frequently Asked Questions) minimal 10 pertanyaan
c. Menyediakan dokumentasi API (jika ada endpoint API)
d. Menyusun troubleshooting guide untuk masalah umum
