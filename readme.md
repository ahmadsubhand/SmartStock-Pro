# SmartStock Pro - WMS Enterprise 📦

SmartStock Pro adalah Sistem Manajemen Gudang (*Warehouse Management System*) tingkat Enterprise berbasis *Cloud-Native*. Dirancang untuk memantau pergerakan logistik, transfer antar cabang, valuasi HPP (FIFO), dan manajemen inventaris secara real-time dengan kontrol keamanan RBAC (*Role-Based Access Control*) yang ketat.

---

## 🚀 Teknologi yang Digunakan

- **Backend:** Laravel 13 (PHP 8.5+)
- **Frontend:** React 19, Inertia.js, TailwindCSS, Shadcn UI
- **Database:** PostgreSQL (Relational)

---

## 📋 Persyaratan Sistem (*Prerequisites*)

Sebelum menginstal aplikasi ini, pastikan sistem Anda (Lokal/Server) sudah terinstal:

1. **PHP** (Minimal versi 8.5) beserta ekstensi:
   - `pdo_pgsql`
   - `mbstring`
   - `xml`
   - `curl`
   - `zip`
   - `gd`

2. **Composer** (*PHP Package Manager*)

3. **Node.js** (Minimal versi 22.x) & **NPM/Yarn**

4. **PostgreSQL** (Minimal versi 16)

5. **Git**

---

# 🛠️ Panduan Instalasi (Development Lokal)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan aplikasi di mesin lokal Anda.

---

## 1. Kloning Repositori

```bash
git clone https://github.com/ahmadsubhand/SmartStock-Pro

cd smartstock-pro
```

---

## 2. Instalasi Dependensi (Backend & Frontend)

### Instal Library PHP

```bash
composer install
```

### Instal Library JavaScript / React

```bash
npm install
```

---

## 3. Konfigurasi Environment (`.env`)

Salin template konfigurasi bawaan:

```bash
cp .env.example .env
```

Buka file `.env`, lalu sesuaikan konfigurasi database, mailer, dan akun super admin. Berikut parameter yang perlu disesuaikan:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smartstock_pro
DB_USERNAME=postgres
DB_PASSWORD=password_db_anda

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME="yourmail@mail.com"
MAIL_PASSWORD="your app password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="yourmail@mail.com"
MAIL_FROM_NAME="${APP_NAME}"

ADMIN_EMAIL=admin@mail.com
ADMIN_PASSWORD=12341234
```

---

## 4. Generate App Key

Generate encryption key Laravel:

```bash
php artisan key:generate
```

---

## 5. Migrasi Database dan Seeder

Membuat struktur tabel PostgreSQL serta data awal:

- Roles & Permissions
- Super Admin
- Data master awal

```bash
php artisan migrate --seed
```

---

## 6. Link Folder Storage

Membuat symbolic link agar file upload dan dokumen dapat diakses browser:

```bash
php artisan storage:link
```

---

## 7. Jalankan Server Backend & Frontend

Terminal


```bash
composer run dev
```

Aplikasi sekarang dapat diakses melalui:

```txt
http://localhost:8000
```

---

# 🔐 Akun Default (Super Admin)


Login menggunakan akun yang sudah di atur dalam .env atau jika tidak mengatur gunakan default:

| Field | Value |
|---|---|
| Email | `admin@mail.com` |
| Password | `12341234` |

---

# 📚 Perintah Umum (*Troubleshooting*)

Jika terjadi:
- perubahan UI tidak muncul
- cache bermasalah
- konfigurasi tidak sinkron

jalankan:

```bash
php artisan optimize:clear
```

Untuk build asset production:

```bash
npm run build
```

Untuk testing alert:
```bash
php artisan wms:check-low-stock  
```