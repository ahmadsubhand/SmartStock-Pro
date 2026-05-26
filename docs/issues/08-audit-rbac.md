# Issue 8: Audit Logging & RBAC Enforcement

## Description
Implementasi sistem pelacakan aktivitas (Audit Trail) dan pengetatan hak akses berdasarkan peran pengguna.

## Goal
Menjamin keamanan, akuntabilitas, dan kepatuhan operasional sistem.

## Tasks
- [ ] Integrasi middleware `ActivityLog`: Mencatat User ID, IP, Action, dan Data (Before/After) pada setiap perubahan.
- [ ] Implementasi Laravel Policies untuk otorisasi setiap modul:
    - [ ] Viewer hanya bisa lihat data & export.
    - [ ] Staf bisa transaksi & transfer.
    - [ ] Manajer bisa CRUD master data & approve.
    - [ ] Admin bisa akses log & server monitoring.
- [ ] Implementasi Session Timeout otomatis (misal: 30 menit tidak aktif).
- [ ] Dashboard Audit Log khusus untuk Admin.

## Tech Stack
- Laravel Policies / Spatie Permission
- Middleware
- Eloquent Observers (for logging)
