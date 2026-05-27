<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ImportController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SystemMonitorController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\TransferController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Auth\AccountActivationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// ========================================================
// UC1: AUTENTIKASI & AKTIVASI AKUN
// Akses: Pengguna terautentikasi & tautan signed URL
// ========================================================
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Rute publik dengan signed URL untuk aktivasi akun
Route::middleware('signed')->group(function () {
    Route::get('/activate-account/{user}', [AccountActivationController::class, 'show'])->name('account.activate.show');
    Route::post('/activate-account/{user}', [AccountActivationController::class, 'update'])->name('account.activate.update');
});

// =================================================================
// RUTE PANEL ADMIN & OPERASIONAL GUDANG
// Menggunakan prefix 'admin' dan name 'admin.' untuk semua rute ini
// =================================================================
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // ========================================================
    // UC1: MANAJEMEN PENGGUNA (SUPER ADMIN ONLY)
    // Akses: Admin
    // ========================================================
    // 1. SUPER ADMIN ONLY (Kelola Pengguna)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });

    // ========================================================
    // UC3: MASTER DATA
    // Akses: Admin & Manager
    // ========================================================
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
        Route::resource('warehouses', WarehouseController::class)->except(['create', 'edit']);
        Route::resource('products', ProductController::class)->except(['create', 'edit']);
        Route::delete('product-images/{image}', [ProductController::class, 'destroyImage'])->name('product-images.destroy');
        Route::resource('suppliers', SupplierController::class)->except(['create', 'edit']);
    });

    // ========================================================
    // UC4: TRANSAKSI BARANG MASUK & KELUAR
    // Akses: Admin & Staff
    // ========================================================
    Route::middleware(['role:admin|staff'])->group(function () {
        Route::resource('transactions', TransactionController::class)->only(['index', 'create', 'store', 'show']);
    });

    // ========================================================
    // UC5: TRANSFER ANTAR GUDANG
    // Akses: Dibagikan sesuai wewenang
    // ========================================================
    
    // Membuat & Mengirim Transfer
    // Akses: Admin & Staff
    Route::middleware(['role:admin|staff'])->group(function () {
        Route::get('transfers/create', [TransferController::class, 'create'])->name('transfers.create');
        Route::post('transfers', [TransferController::class, 'store'])->name('transfers.store');
    });

    // Melihat Daftar & Detail Transfer
    // Akses: Admin, Manager, Staff
    Route::middleware(['role:admin|manager|staff'])->group(function () {
        Route::get('transfers', [TransferController::class, 'index'])->name('transfers.index');
        Route::get('transfers/{transfer}', [TransferController::class, 'show'])->name('transfers.show');
    });

    // Menerima / Verifikasi Transfer
    // Akses: Admin & Manage
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::patch('transfers/{transfer}/receive', [TransferController::class, 'receive'])->name('transfers.receive');
    });

    // ========================================================
    // UC6: IMPORT DATA PRODUK BATCH (CSV)
    // Akses: Admin
    // ========================================================
    Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');
    Route::get('/imports/batch/{batchId}', [ImportController::class, 'status'])->name('imports.status');

    // ========================================================
    // UC7: EKSPOR LAPORAN PDF
    // Akses: Admin, Manager, Viewer
    // ========================================================
    Route::middleware(['role:admin|manager|viewer'])->group(function () {
        Route::get('reports', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
        Route::post('reports', [App\Http\Controllers\Admin\ReportController::class, 'store'])->name('reports.store');
        Route::get('reports/{document}/download', [App\Http\Controllers\Admin\ReportController::class, 'download'])->name('reports.download');
    });

    // ========================================================
    // UC8: MEMANTAU SERVER & LOG
    // Akses: Admin
    // ========================================================
    Route::get('/system-monitor', [SystemMonitorController::class, 'index'])->name('system.monitor');
});

// ========================================================
// UC9: NOTIFIKASI
// Akses: Admin, Manager, Staff
// ========================================================
Route::middleware(['auth'])->prefix('admin')->group(function() {
    // API Cepat untuk Notifikasi
    Route::get('/notifications', function () {
        return response()->json(Auth::user()->unreadNotifications);
    })->name('notifications.index');

    Route::post('/notifications/mark-as-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    })->name('notifications.markAllRead');
});

require __DIR__.'/settings.php';
