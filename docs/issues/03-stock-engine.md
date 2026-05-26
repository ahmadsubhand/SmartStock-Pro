# Issue 3: Stock Transaction Engine (FIFO/LIFO Logic)

## Description
Membangun logika inti untuk pemrosesan transaksi barang masuk dan keluar menggunakan algoritma FIFO (First-In, First-Out).

## Goal
Menjamin akurasi stok dan nilai valuasi inventaris secara otomatis dan aman dari race condition.

## Tasks
- [ ] Buat `StockService` untuk enkapsulasi logika mutasi stok.
- [ ] Implementasi Logika Barang Masuk: Menambah data ke `product_batches` dan `stock_mutations`.
- [ ] Implementasi Logika Barang Keluar (FIFO):
    - [ ] Cari batch tertua yang masih memiliki stok di gudang terkait.
    - [ ] Kurangi stok batch secara berurutan hingga jumlah permintaan terpenuhi.
    - [ ] Update `current_quantity` pada `product_batches`.
- [ ] Gunakan `DB::transaction()` untuk menjamin integritas data.
- [ ] Implementasi `lockForUpdate()` pada query pencarian batch untuk mencegah data inconsitency pada transaksi konkuren.

## Tech Stack
- Laravel 13 (Service Layer, DB Transactions)
- PostgreSQL (Row-Level Locking)
