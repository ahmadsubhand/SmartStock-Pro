<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ImportProductChunk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Inertia\Inertia;
use Exception;

class ImportController extends Controller
{
    /**
     * Menampilkan halaman upload CSV
     */
    public function index()
    {
        return Inertia::render('admin/imports/index');
    }

    /**
     * Memproses file upload dan mendistribusikannya ke Background Workers
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:51200', // Maks 50MB
        ]);

        try {
            $path = $request->file('file')->getRealPath();
            
            // Menggunakan fopen() untuk membaca baris demi baris 
            // sehingga RAM server tidak jebol meski file berisi 1 juta baris (Streaming)
            $handle = fopen($path, 'r');
            
            // Baca baris pertama (biasanya Header kolom) dan lewati
            $header = fgetcsv($handle);
            
            $chunkSize = 500; // Satu worker akan mengerjakan 500 baris
            $chunk = [];
            $jobs = [];

            while (($row = fgetcsv($handle)) !== false) {
                // Abaikan baris kosong
                if (empty(array_filter($row))) {
                    continue;
                }
                
                $chunk[] = $row;
                
                // Jika keranjang chunk sudah penuh (500), bungkus jadi 1 Job
                if (count($chunk) === $chunkSize) {
                    $jobs[] = new ImportProductChunk($chunk);
                    $chunk = []; // Kosongkan keranjang untuk 500 baris berikutnya
                }
            }

            // Jika masih ada sisa baris yang kurang dari 500, masukkan ke job terakhir
            if (count($chunk) > 0) {
                $jobs[] = new ImportProductChunk($chunk);
            }
            
            fclose($handle);

            // Cek jika file ternyata kosong isinya
            if (empty($jobs)) {
                return response()->json(['error' => 'File CSV tidak berisi data valid.'], 422);
            }

            // Daftarkan kelompok Job ini ke Laravel Batching
            $batch = Bus::batch($jobs)
                ->name('Batch Import Produk: ' . now()->format('Y-m-d H:i:s'))
                ->dispatch();

            // Kembalikan Batch ID (bukan halaman reload), karena React butuh ID ini untuk Polling
            return response()->json([
                'batch_id' => $batch->id,
                'message' => 'File berhasil masuk antrean. Memproses di latar belakang...'
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => 'Gagal membaca file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint API untuk mengecek progress bar secara realtime
     */
    public function status(string $batchId)
    {
        $batch = Bus::findBatch($batchId);
        
        if (!$batch) {
            return response()->json(['progress' => 0, 'finished' => false]);
        }

        return response()->json([
            'progress' => $batch->progress(),
            'finished' => $batch->finished(),
            'failed' => $batch->hasFailures(),
            'total_jobs' => $batch->totalJobs,
            'processed_jobs' => $batch->processedJobs,
        ]);
    }
}