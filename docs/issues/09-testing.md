# Issue 9: Testing & Quality Assurance (Pest PHP)

## Description
Pembuatan suite pengujian otomatis untuk menjamin stabilitas aplikasi sebelum rilis.

## Goal
Mencegah regresi dan memastikan logika bisnis (terutama stok) berjalan 100% benar.

## Tasks
- [ ] Tulis Feature Test untuk alur Mutasi Stok (FIFO logic).
- [ ] Tulis Feature Test untuk Transfer Antar Gudang (termasuk skenario kegagalan).
- [ ] Tulis Integration Test untuk Batch Import (validasi data & job execution).
- [ ] Tulis Smoke Test untuk memastikan semua halaman utama (Dashboard, CRUD) bisa diakses sesuai Role.
- [ ] Implementasi `assertNoJavaScriptErrors()` pada pengujian browser untuk dashboard interaktif.

## Tech Stack
- Pest PHP v4
- Laravel Dusk / Browser Testing
- Database Factories
