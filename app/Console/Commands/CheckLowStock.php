<?php

namespace App\Console\Commands;

use App\Models\StockSummary;
use App\Models\User;
use App\Notifications\LowStockAlert;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

class CheckLowStock extends Command
{
    /**
     * Nama perintah untuk dipanggil di terminal atau scheduler
     */
    protected $signature = 'wms:check-low-stock';

    /**
     * Deskripsi perintah
     */
    protected $description = 'Mengecek seluruh stok gudang dan mengirimkan alert jika berada di bawah batas minimum.';

    public function handle()
    {
        $this->info('Memulai pengecekan stok...');

        // 1. Ambil data stok yang menipis
        $lowStocks = StockSummary::select('stock_summaries.*')
            ->join('products', 'stock_summaries.product_id', '=', 'products.id')
            ->whereColumn('stock_summaries.total_qty', '<=', 'products.min_stock_level')
            ->where('products.min_stock_level', '>', 0) 
            ->with(['product', 'warehouse'])
            ->get();

        if ($lowStocks->isEmpty()) {
            $this->info('Semua stok dalam keadaan aman.');
            return;
        }

        $usersToNotify = User::role(['admin', 'manager'])->get();

        // 2. Ambil SEMUA riwayat notifikasi peringatan stok hari ini (Hanya 1 Query Database!)
        // Ini menghindari masalah N+1 Query dan menghindari error parsing JSON di PostgreSQL
        $todaysAlerts = DatabaseNotification::where('type', LowStockAlert::class)
            ->whereDate('created_at', now()->toDateString())
            ->get();

        $count = 0;
        foreach ($lowStocks as $stock) {
            // 3. Pengecekan duplikasi dilakukan di level Collection (Memori RAM), bukan di Database
            $alreadyNotified = $todaysAlerts->contains(function ($notification) use ($stock) {
                // Notifikasi membaca field 'data' secara otomatis sebagai array berkat casting bawaan Laravel
                return isset($notification->data['product_id']) && 
                       $notification->data['product_id'] == $stock->product_id && 
                       $notification->data['warehouse_name'] == $stock->warehouse->name;
            });

            if (!$alreadyNotified) {
                Notification::send($usersToNotify, new LowStockAlert($stock));
                $count++;
            }
        }

        $this->info("Berhasil mengirim {$count} alert peringatan stok.");
    }
}