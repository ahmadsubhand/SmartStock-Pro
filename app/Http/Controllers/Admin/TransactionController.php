<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\StockSummary;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Models\Warehouse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $type = $request->input('type');
        $sortField = $request->input('sort_field', 'created_at');
        $sortDir = $request->input('sort_direction', 'desc');

        // Mengambil data transaksi beserta relasinya
        $transactions = Transaction::with(['warehouse', 'supplier', 'user'])
            ->when($search, function ($query, $search) {
                $searchTerm = strtolower($search);
                // Pencarian case-insensitive berdasarkan Nomor Referensi
                $query->whereRaw('LOWER(reference_no) LIKE ?', ["%{$searchTerm}%"]);
            })
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy($sortField, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Menampilkan form untuk membuat transaksi baru (Inbound/Outbound)
     */
    public function create()
    {
        // Mengambil data master dan hanya memilih kolom yang dibutuhkan
        // untuk menghemat payload / ukuran data yang dikirim ke frontend
        $warehouses = Warehouse::where('is_active', true)->get(['id', 'name']);
        $suppliers = Supplier::get(['id', 'name']);
        $products = Product::get(['id', 'sku', 'name']);

        return Inertia::render('admin/transactions/create', [
            'warehouses' => $warehouses,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    /**
     * Menyimpan transaksi ke database (Contoh fokus: Inbound)
     */
    public function store(Request $request)
    {
        // 1. Validasi Input dari Frontend
        $validated = $request->validate([
            'type' => 'required|in:in,out',
            'warehouse_id' => 'required|exists:warehouses,id',
            'supplier_id' => 'nullable|exists:suppliers,id', // Nullable karena outbound mungkin tanpa supplier
            'reference_no' => 'required|string|unique:transactions,reference_no',
            'items' => 'required|array|min:1', // Array keranjang barang
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        // 2. Gunakan DB Transaction agar aman (Jika gagal satu, gagal semua / Rollback)
        try {
            DB::beginTransaction();

            // A. Buat Header Transaksi
            $transaction = Transaction::create([
                'type' => $validated['type'],
                'warehouse_id' => $validated['warehouse_id'],
                'user_id' => Auth::id(), // Kasir / Admin yang login
                'supplier_id' => $validated['supplier_id'],
                'reference_no' => $validated['reference_no'],
                'status' => 'completed', // Asumsi Inbound langsung masuk, bisa disesuaikan jadi 'pending'
            ]);

            // B. Looping setiap barang yang ada di keranjang (items)
            foreach ($validated['items'] as $item) {
                $qtyToProcess = $item['qty'];
                $productId = $item['product_id'];
                $warehouseId = $validated['warehouse_id'];
                
                // B1. Simpan ke Transaction Details
                $transaction->details()->create([
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_cost' => $item['unit_cost'],
                ]);

                if ($validated['type'] === 'in') {
                    // B2. Buat Inventory Batch baru (Fondasi perhitungan FIFO)
                    InventoryBatch::create([
                        'product_id' => $item['product_id'],
                        'warehouse_id' => $validated['warehouse_id'],
                        'transaction_id' => $transaction->id,
                        'transfer_id' => null,
                        'original_qty' => $item['qty'],
                        'remaining_qty' => $item['qty'], // Sisa qty sama dengan original saat baru masuk
                        'unit_cost' => $item['unit_cost'],
                    ]);

                    // B3. Perbarui (atau Buat) Stock Summary untuk performa Dashboard
                    $stockSummary = StockSummary::where('product_id', $item['product_id'])
                        ->where('warehouse_id', $validated['warehouse_id'])
                        ->first();

                    if ($stockSummary) {
                        // Jika sudah ada stok sebelumnya, tambahkan
                        $stockSummary->increment('total_qty', $item['qty']);
                    } else {
                        // Jika produk ini belum pernah ada di gudang tersebut
                        StockSummary::create([
                            'product_id' => $item['product_id'],
                            'warehouse_id' => $validated['warehouse_id'],
                            'total_qty' => $item['qty'],
                        ]);
                    }
                } else {
                    // --- LOGIKA OUTBOUND (Barang Keluar - FIFO) ---
                    
                    // A. Cek kecukupan stok secara global (di tabel aggregate)
                    $stockSummary = StockSummary::where('product_id', $productId)
                        ->where('warehouse_id', $warehouseId)
                        ->lockForUpdate() // Kunci baris ini agar tidak dibaca transaksi lain yang berjalan bersamaan
                        ->first();

                    if (!$stockSummary || $stockSummary->total_qty < $qtyToProcess) {
                        throw new Exception("Stok tidak mencukupi untuk Produk ID: {$productId}. Sisa stok: " . ($stockSummary->total_qty ?? 0));
                    }

                    // B. Ambil batch yang masih ada sisa, urutkan dari TERTUA (FIFO)
                    $batches = InventoryBatch::where('product_id', $productId)
                        ->where('warehouse_id', $warehouseId)
                        ->where('remaining_qty', '>', 0)
                        ->orderBy('created_at', 'asc') // ASC = Yang paling dulu masuk (First In)
                        ->lockForUpdate() 
                        ->get();

                    $qtyRemainingToFulfill = $qtyToProcess;
                    $totalCost = 0; // Untuk menghitung HPP (Harga Pokok Penjualan) sesungguhnya

                    // C. Lakukan pemotongan stok per batch
                    foreach ($batches as $batch) {
                        if ($qtyRemainingToFulfill <= 0) break; // Jika kebutuhan qty sudah terpenuhi, hentikan loop

                        // Berapa banyak yang bisa diambil dari batch ini?
                        $takeQty = min($batch->remaining_qty, $qtyRemainingToFulfill);
                        
                        // Potong qty di batch tersebut
                        $batch->decrement('remaining_qty', $takeQty);
                        
                        // Hitung nilai HPP dari barang yang diambil
                        $totalCost += ($takeQty * $batch->unit_cost);

                        // Kurangi target yang harus dipenuhi
                        $qtyRemainingToFulfill -= $takeQty;
                    }

                    // D. Pengaman jika sistem gagal memotong batch secara utuh
                    if ($qtyRemainingToFulfill > 0) {
                        throw new Exception("Inkonsistensi data: Stok di ringkasan cukup, tetapi rincian batch tidak mencukupi untuk Produk ID: {$productId}.");
                    }

                    // E. Kurangi stok global
                    $stockSummary->decrement('total_qty', $qtyToProcess);

                    // F. Catat ke Transaction Details dengan Harga Pokok Rata-rata dari batch yang ditarik
                    $averageUnitCost = $totalCost / $qtyToProcess;
                    $transaction->details()->create([
                        'product_id' => $productId,
                        'qty' => $qtyToProcess,
                        'unit_cost' => $averageUnitCost,
                    ]);
                }
            }

            DB::commit(); // Simpan permanen ke database

            return redirect()->route('admin.transactions.index')
                ->with('success', 'Transaksi berhasil diproses dan stok telah diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan semua aksi jika terjadi error

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }

    /**
     * Menampilkan detail spesifik dari sebuah transaksi.
     */
    public function show(Transaction $transaction)
    {
        // Muat relasi yang dibutuhkan: gudang, supplier, user, dan detail barang (beserta produknya)
        $transaction->load([
            'warehouse', 
            'supplier', 
            'user', 
            'details.product' // Tarik juga data produk di setiap detail
        ]);

        return Inertia::render('admin/transactions/show', [
            'transaction' => $transaction
        ]);
    }
}