# Issue 5: Interactive Dashboard & Warehouse Mapping

## Description
Visualisasi data statistik inventaris dan lokasi fisik gudang dalam bentuk dashboard interaktif.

## Goal
Memberikan insight real-time bagi manajemen untuk pengambilan keputusan cepat.

## Tasks
- [ ] Setup Dashboard Page di React menggunakan komponen chart (contoh: Recharts).
- [ ] Implementasi widget statistik:
    - [ ] Total Nilai Inventaris (IDR).
    - [ ] Tren Mutasi Barang (7 hari terakhir).
    - [ ] Top 5 Fast-Moving Products.
- [ ] Integrasi Leaflet.js atau Google Maps untuk Peta Gudang.
- [ ] Tampilkan marker gudang dengan popup info stok saat ini.
- [ ] Widget "Stok Kritis": Menampilkan daftar produk yang mendekati atau di bawah threshold.

## Tech Stack
- React 19 (Charts, Maps Library)
- Inertia.js (Data Fetching)
- Tailwind CSS
