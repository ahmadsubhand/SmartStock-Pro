<?php

namespace App\Jobs;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ImportProductChunk implements ShouldQueue
{
    // Batchable sangat penting di sini agar job bisa dikelompokkan dan dihitung progress-nya
    use Batchable, Dispatchable, InteractsWithQueue, SerializesModels;

    public array $chunk;

    /**
     * Create a new job instance.
     */
    public function __construct(array $chunk)
    {
        $this->chunk = $chunk;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Jika admin menekan tombol "Batalkan Import" di frontend, job ini tidak akan dilanjutkan
        if ($this->batch()->cancelled()) {
            return;
        }

        DB::beginTransaction();

        try {
            foreach ($this->chunk as $row) {
                // Asumsi urutan kolom CSV: SKU, Nama, Kategori, Deskripsi, Min Stok
                // Kita gunakan updateOrCreate agar jika SKU sudah ada, datanya diupdate (Upsert)
                
                // Cari atau buat kategori berdasarkan nama
                $category = Category::firstOrCreate([
                    'name' => trim($row[2])
                ]);

                Product::updateOrCreate(
                    ['sku' => trim($row[0])], // Acuan pencarian (SKU harus unik)
                    [
                        'name' => trim($row[1]),
                        'category_id' => $category->id,
                        'description' => $row[3] ?? null,
                        'min_stock_level' => (int) ($row[4] ?? 0),
                    ]
                );
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            // Lemparkan error agar tercatat di tabel failed_jobs
            throw $e;
        }
    }
}