<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\StockSummary;
use App\Models\Transfer;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;
use Illuminate\Support\Facades\Auth;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $transfers = Transfer::with(['fromWarehouse', 'toWarehouse', 'user'])
            ->when($search, function ($query, $search) {
                $query->whereRaw('LOWER(reference_no) LIKE ?', ["%" . strtolower($search) . "%"]);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/transfers/index', [
            'transfers' => $transfers,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/transfers/create', [
            'warehouses' => Warehouse::where('is_active', true)->get(['id', 'name']),
            'products' => Product::get(['id', 'sku', 'name']),
        ]);
    }

    /**
     * FASE 1: Membuat Surat Jalan (Barang dikirim dan berstatus In-Transit)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'reference_no' => 'required|string|unique:transfers,reference_no',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ], [
            'to_warehouse_id.different' => 'Gudang tujuan tidak boleh sama dengan gudang asal.'
        ]);

        try {
            DB::beginTransaction();

            // 1. Buat Header Transfer
            $transfer = Transfer::create([
                'from_warehouse_id' => $validated['from_warehouse_id'],
                'to_warehouse_id' => $validated['to_warehouse_id'],
                'user_id' => Auth::id(),
                'reference_no' => $validated['reference_no'],
                'status' => 'in_transit', // Barang berstatus di perjalanan
                'shipped_at' => now(),
            ]);

            // 2. Potong Stok Gudang Asal (Metode FIFO)
            foreach ($validated['items'] as $item) {
                $qtyToProcess = $item['qty'];
                $productId = $item['product_id'];
                $fromWarehouseId = $validated['from_warehouse_id'];

                // A. Kunci StockSummary Gudang Asal
                $stockSummary = StockSummary::where('product_id', $productId)
                    ->where('warehouse_id', $fromWarehouseId)
                    ->lockForUpdate()
                    ->first();

                if (!$stockSummary || $stockSummary->total_qty < $qtyToProcess) {
                    throw new Exception("Stok tidak mencukupi untuk Produk ID: {$productId} di Gudang Asal.");
                }

                // B. Ambil batch tertua (FIFO) di Gudang Asal
                $batches = InventoryBatch::where('product_id', $productId)
                    ->where('warehouse_id', $fromWarehouseId)
                    ->where('remaining_qty', '>', 0)
                    ->orderBy('created_at', 'asc')
                    ->lockForUpdate()
                    ->get();

                $qtyRemainingToFulfill = $qtyToProcess;
                $totalCost = 0;

                // C. Proses Pemotongan
                foreach ($batches as $batch) {
                    if ($qtyRemainingToFulfill <= 0) break;

                    $takeQty = min($batch->remaining_qty, $qtyRemainingToFulfill);
                    $batch->decrement('remaining_qty', $takeQty);
                    
                    $totalCost += ($takeQty * $batch->unit_cost);
                    $qtyRemainingToFulfill -= $takeQty;
                }

                if ($qtyRemainingToFulfill > 0) {
                    throw new Exception("Inkonsistensi data batch pada Produk ID: {$productId}.");
                }

                // D. Kurangi agregat stok global (Karena Anda sudah override setKeysForSaveQuery)
                $stockSummary->decrement('total_qty', $qtyToProcess);

                // E. Simpan Detail Transfer beserta HPP Rata-rata
                $averageUnitCost = $totalCost / $qtyToProcess;
                $transfer->details()->create([
                    'product_id' => $productId,
                    'qty' => $qtyToProcess,
                    'unit_cost' => $averageUnitCost, // Simpan harga agar dibawa oleh truk
                ]);
            }

            DB::commit();

            return redirect()->route('admin.transfers.index')
                ->with('success', 'Transfer berhasil dibuat. Barang sedang dalam perjalanan (In-Transit).');

        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }

    public function show(Transfer $transfer)
    {
        $transfer->load(['fromWarehouse', 'toWarehouse', 'user', 'details.product']);
        
        return Inertia::render('admin/transfers/show', [
            'transfer' => $transfer
        ]);
    }

    /**
     * FASE 2: Menerima Barang di Gudang Tujuan (Barang tiba, stok tujuan bertambah)
     */
    public function receive(Transfer $transfer)
    {
        // Pastikan hanya barang yang masih di jalan yang bisa diterima
        if ($transfer->status !== 'in_transit') {
            return redirect()->back()->with('error', 'Transaksi ini sudah diproses atau dibatalkan.');
        }

        try {
            DB::beginTransaction();

            $transfer->load('details');

            foreach ($transfer->details as $detail) {
                // 1. Buat Batch Baru di Gudang Tujuan 
                // Menggunakan unit_cost (HPP) yang dibawa dari Gudang Asal
                InventoryBatch::create([
                    'product_id' => $detail->product_id,
                    'warehouse_id' => $transfer->to_warehouse_id,
                    'transaction_id' => null,
                    'transfer_id' => $transfer->id,
                    'original_qty' => $detail->qty,
                    'remaining_qty' => $detail->qty,
                    'unit_cost' => $detail->unit_cost,
                ]);

                // 2. Tambahkan ke Stock Summary Gudang Tujuan
                StockSummary::firstOrCreate(
                    ['product_id' => $detail->product_id, 'warehouse_id' => $transfer->to_warehouse_id],
                    ['total_qty' => 0]
                );
                
                // Kunci baris tujuan agar aman dari race condition saat update
                StockSummary::where('product_id', $detail->product_id)
                    ->where('warehouse_id', $transfer->to_warehouse_id)
                    ->lockForUpdate()
                    ->increment('total_qty', $detail->qty);
            }

            // 3. Update status Transfer menjadi selesai
            $transfer->update([
                'status' => 'completed',
                'received_at' => now(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Barang berhasil diterima dan masuk ke gudang tujuan.');

        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}