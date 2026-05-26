# Issue 6: Real-Time Notifications & Alert System

## Description
Implementasi sistem peringatan otomatis melalui WebSocket dan email untuk kondisi kritis.

## Goal
Memastikan tim operasional segera mengetahui adanya masalah stok atau sistem.

## Tasks
- [ ] Konfigurasi Laravel Reverb untuk WebSocket broadcasting.
- [ ] Buat event `LowStockDetected` yang dipicu saat mutasi stok mencapai threshold.
- [ ] Implementasi In-App Notification (Toast/Bell Icon) di React untuk alert stok.
- [ ] Setup pengiriman email otomatis untuk alert kritis ke Manajer Gudang.
- [ ] Dashboard Log Error untuk Admin:
    - [ ] Menampilkan exception yang tercatat di log database.
    - [ ] Filter berdasarkan severity.

## Tech Stack
- Laravel Reverb (WebSockets)
- Laravel Notifications (Email, Database)
- React (Real-time listeners)
