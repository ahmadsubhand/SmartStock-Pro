# Issue 7: Batch Operations & PDF Reporting

## Description
Implementasi pengolahan data masif (Import Excel) dan pembuatan laporan PDF secara background.

## Goal
Mendukung skalabilitas data besar tanpa membebani performa server utama atau UI.

## Tasks
- [ ] Implementasi Batch Import Produk via Excel/CSV:
    - [ ] Gunakan Laravel Excel Batch Inserts.
    - [ ] Validasi data di background job.
    - [ ] Push progress update ke UI via WebSocket.
- [ ] Fitur Export Laporan PDF:
    - [ ] Generate laporan stok per gudang dengan logo dan grafik.
    - [ ] Gunakan Background Job untuk generate file besar.
    - [ ] Kirim notifikasi download link ke user setelah selesai.

## Tech Stack
- Laravel Excel
- Laravel Jobs (Redis)
- DomPDF / Browsershot
- WebSockets (Progress tracking)
