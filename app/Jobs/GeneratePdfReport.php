<?php

namespace App\Jobs;

use App\Models\ExportDocument;
use App\Models\StockSummary;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GeneratePdfReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public ExportDocument $exportDocument;
    
    // Memberikan batas waktu maksimal eksekusi (contoh: 5 menit)
    public $timeout = 300; 

    public function __construct(ExportDocument $exportDocument)
    {
        $this->exportDocument = $exportDocument;
    }

    public function handle(): void
    {
        try {
            // 1. Tandai bahwa dokumen sedang diproses
            $this->exportDocument->update(['status' => 'processing']);

            // 2. Ambil data berdasarkan tipe laporan
            $data = [];
            if ($this->exportDocument->type === 'inventory') {
                // Eager load relasi untuk mencegah N+1 query problem
                $data = StockSummary::with(['product', 'warehouse'])->get();
            } 
            // Nanti Anda bisa menambahkan tipe 'transaction' dll di sini

            // 3. Render View HTML menjadi PDF (Kita akan buat file view-nya nanti)
            $pdf = Pdf::loadView('reports.inventory_pdf', [
                'data' => $data,
                'report_name' => $this->exportDocument->report_name,
                'generated_at' => now()->format('d M Y H:i:s'),
                'generated_by' => $this->exportDocument->user->name
            ]);

            // Set ukuran kertas
            $pdf->setPaper('A4', 'landscape');

            // 4. Tentukan nama dan lokasi penyimpanan
            $fileName = 'reports/report_' . $this->exportDocument->id . '_' . time() . '.pdf';
            
            // Simpan ke storage/app/public/reports
            Storage::disk('public')->put($fileName, $pdf->output());

            // 5. Update status menjadi selesai dan simpan path file-nya
            $this->exportDocument->update([
                'status' => 'completed',
                'file_path' => $fileName
            ]);

        } catch (Throwable $e) {
            // Jika terjadi kegagalan (misal timeout atau error SQL)
            $this->exportDocument->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }
    }
}