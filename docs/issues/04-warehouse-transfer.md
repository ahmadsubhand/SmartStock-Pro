# Issue 4: Inter-Warehouse Transfer with Parallel Processing

## Description
Implementasi fitur pemindahan stok antar gudang yang diproses secara asynchronous untuk performa maksimal.

## Goal
Memudahkan distribusi barang antar cabang dengan koordinasi sistematis dan cepat.

## Tasks
- [ ] Buat UI Form Transfer: Input Gudang Asal, Gudang Tujuan, Produk, dan Jumlah.
- [ ] Implementasi `TransferJob` menggunakan Laravel Queues.
- [ ] Logika Transfer:
    - [ ] Kurangi stok di Gudang Asal (mengikuti logika FIFO).
    - [ ] Tambah stok di Gudang Tujuan sebagai batch baru.
    - [ ] Catat mutasi dengan tipe `TRANSFER`.
- [ ] Pastikan error handling yang kuat: Rollback jika salah satu sisi gagal.
- [ ] Implementasi status transfer (Pending, Processing, Completed, Failed).

## Tech Stack
- Laravel Queues (Redis)
- Inertia.js (UI Form)
- StockService (Reuse Logic)
