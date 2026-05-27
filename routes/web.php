<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ImportController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\TransferController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Auth\AccountActivationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Rute Publik dengan Middleware "signed" untuk keamanan URL
Route::middleware('signed')->group(function () {
    Route::get('/activate-account/{user}', [AccountActivationController::class, 'show'])->name('account.activate.show');
    Route::post('/activate-account/{user}', [AccountActivationController::class, 'update'])->name('account.activate.update');
});

// =================================================================
// RUTE PANEL ADMIN & OPERASIONAL GUDANG
// Kita menggunakan prefix 'admin' dan name 'admin.' untuk semua rute ini
// =================================================================
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // 1. SUPER ADMIN ONLY (Kelola Pengguna)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });
    
    // Rute Batch Import (UC6)
    Route::get('/imports', [ImportController::class, 'index'])->name('imports.index');
    Route::post('/imports', [ImportController::class, 'store'])->name('imports.store');
    Route::get('/imports/batch/{batchId}', [ImportController::class, 'status'])->name('imports.status');

    // 2. UC3: MASTER DATA (Akses: Admin & Manajer Gudang)
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
        Route::resource('warehouses', WarehouseController::class)->except(['create', 'edit']);
        Route::resource('products', ProductController::class)->except(['create', 'edit']);
        Route::delete('product-images/{image}', [ProductController::class, 'destroyImage'])->name('product-images.destroy');
        Route::resource('suppliers', SupplierController::class)->except(['create', 'edit']);
    });

    // 3. UC4: TRANSAKSI MASUK/KELUAR (Akses: Admin & Staf Gudang)
    // Manajer hanya melihat via dashboard, staf yang mengeksekusi
    Route::middleware(['role:admin|staff'])->group(function () {
        Route::resource('transactions', TransactionController::class)->only(['index', 'create', 'store', 'show']);
    });

    // 4. UC5: TRANSFER ANTAR GUDANG (Akses Dibagi Sesuai Wewenang)
    
    // b. Membuat/Kirim Transfer (Hak Akses: Staf & Admin)
    Route::middleware(['role:admin|staff'])->group(function () {
        Route::get('transfers/create', [TransferController::class, 'create'])->name('transfers.create');
        Route::post('transfers', [TransferController::class, 'store'])->name('transfers.store');
    });

    // a. Semua (Admin, Manajer, Staf) boleh melihat daftar dan detail transfer
    Route::middleware(['role:admin|manager|staff'])->group(function () {
        Route::get('transfers', [TransferController::class, 'index'])->name('transfers.index');
        Route::get('transfers/{transfer}', [TransferController::class, 'show'])->name('transfers.show');
    });

    // c. Menerima Transfer / Verifikasi (Hak Akses: Manajer & Admin)
    Route::middleware(['role:admin|manager'])->group(function () {
        Route::patch('transfers/{transfer}/receive', [TransferController::class, 'receive'])->name('transfers.receive');
    });
});

require __DIR__.'/settings.php';
