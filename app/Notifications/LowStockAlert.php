<?php

namespace App\Notifications;

use App\Models\StockSummary;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification
{
    use Queueable;

    protected StockSummary $stockData;

    /**
     * Create a new notification instance.
     */
    public function __construct(StockSummary $stockData)
    {
        $this->stockData = $stockData;
    }

    /**
     * Tentukan saluran: 'database' untuk In-App (Lonceng), 'mail' untuk Email
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Format untuk Notifikasi Lonceng (UI)
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'product_id' => $this->stockData->product_id,
            'sku' => $this->stockData->product->sku,
            'product_name' => $this->stockData->product->name,
            'warehouse_name' => $this->stockData->warehouse->name,
            'current_qty' => $this->stockData->total_qty,
            'min_qty' => $this->stockData->product->min_stock_level,
            'message' => "Stok {$this->stockData->product->name} di {$this->stockData->warehouse->name} tersisa {$this->stockData->total_qty} (Minimum: {$this->stockData->product->min_stock_level}).",
        ];
    }

    /**
     * Format untuk Template Email Otomatis
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->error() // Akan membuat tombol/header menjadi warna merah (peringatan)
            ->subject('Peringatan: Stok Menipis - ' . $this->stockData->product->name)
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line("Sistem mendeteksi bahwa stok untuk produk **{$this->stockData->product->name}** di gudang **{$this->stockData->warehouse->name}** saat ini hanya tersisa **{$this->stockData->total_qty}** unit.")
            ->line("Jumlah ini berada di bawah batas minimum yang telah ditetapkan (yaitu {$this->stockData->product->min_stock_level} unit).")
            ->action('Lihat Data Inventaris', url('/admin/dashboard'))
            ->line('Mohon segera lakukan pengadaan ulang (restock) untuk menghindari terhentinya operasional perusahaan.');
    }
}