<?php

use App\Http\Controllers\Admin\CategoryController;
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

// Rute Tertutup (Hanya untuk Admin)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');

    Route::resource('categories', CategoryController::class)
        ->except(['create', 'edit']);

    Route::resource('warehouses', WarehouseController::class)
        ->except(['create', 'edit']);

    Route::resource('products', ProductController::class)
        ->except(['create', 'edit']);
    Route::delete('product-images/{image}', [ProductController::class, 'destroyImage'])
        ->name('product-images.destroy');

    Route::resource('suppliers', SupplierController::class)
        ->except(['create', 'edit']);

    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'create', 'store', 'show']);

    Route::resource('transfers', TransferController::class)
        ->only(['index', 'create', 'store', 'show']);
    Route::patch('transfers/{transfer}/receive', [TransferController::class, 'receive'])
        ->name('transfers.receive');
    // ... route CRUD master data lainnya
});

require __DIR__.'/settings.php';
