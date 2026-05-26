# Issue 1: Database Migration to PostgreSQL & Core Inventory Schema

## Description
Migrasi database dari SQLite ke PostgreSQL 16 dan siapkan skema tabel inti untuk manajemen inventaris.

## Goal
Menyiapkan fondasi data yang tangguh dan transaksional sesuai dengan spesifikasi SDD.

## Tasks
- [ ] Update `.env` dan `config/database.php` untuk menggunakan driver `pgsql`.
- [ ] Buat migrasi untuk tabel `warehouses` (id, name, location_lat, location_long, capacity, address).
- [ ] Buat migrasi untuk tabel `categories` (id, name, slug, description).
- [ ] Buat migrasi untuk tabel `suppliers` (id, name, contact_person, phone, email, address).
- [ ] Buat migrasi untuk tabel `products` (id, sku, name, description, category_id, unit, min_threshold, image_url).
- [ ] Buat migrasi untuk tabel `product_batches` (id, product_id, warehouse_id, batch_number, buy_price, initial_quantity, current_quantity, received_at).
- [ ] Buat migrasi untuk tabel `stock_mutations` (id, product_id, warehouse_id, type [IN, OUT, TRANSFER], quantity, reference_id, created_at).
- [ ] Setup model Eloquent dengan relasi (BelongsTo, HasMany) dan attribute casting yang sesuai.

## Tech Stack
- Laravel 13 (Migrations, Eloquent)
- PostgreSQL 16
