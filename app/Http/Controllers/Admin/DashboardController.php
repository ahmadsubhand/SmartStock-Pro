<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\StockSummary;
use App\Models\Transaction;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Menghitung Total Valuasi Inventaris (Nilai Uang dari HPP FIFO)
        $totalValuation = InventoryBatch::where('remaining_qty', '>', 0)
            ->sum(DB::raw('remaining_qty * unit_cost'));

        // 2. Metrik Dasar
        $totalProducts = Product::count();
        $totalWarehouses = Warehouse::count();
        $totalStock = StockSummary::sum('total_qty');

        // 3. Data Grafik Tren (Mutasi Stok 7 Hari Terakhir)
        // Menyesuaikan dengan Enum: 'in', 'out', 'adjustment'
        $trendData = DB::table('transactions')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("SUM(CASE WHEN type = 'in' THEN 1 ELSE 0 END) as in_count"),
                DB::raw("SUM(CASE WHEN type = 'out' THEN 1 ELSE 0 END) as out_count")
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // 4. Data Peta Lokasi Gudang
        // Jika tabel Anda belum punya kolom latitude/longitude, kita berikan fallback koordinat default
        $fallbackCoords = [
            ['-6.200000', '106.816666'], // Jakarta
            ['-7.250445', '112.768845'], // Surabaya
            ['-6.914744', '107.609810'], // Bandung
            ['-0.947083', '100.369592'], // Padang
            ['-5.147665', '119.432731'], // Makassar
        ];

        $warehouses = Warehouse::all()->map(function ($warehouse, $index) use ($fallbackCoords) {
            return [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'location' => $warehouse->location,
                // Gunakan lat/lng dari database jika ada, jika tidak gunakan fallback array
                'lat' => $warehouse->latitude ?? $fallbackCoords[$index % 5][0],
                'lng' => $warehouse->longitude ?? $fallbackCoords[$index % 5][1],
                'is_active' => $warehouse->is_active
            ];
        });

        // 5. Aktivitas Terakhir (5 Transaksi/Transfer Terbaru)
        $recentActivities = Transaction::with(['user', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($trx) {
                return [
                    'id' => $trx->id,
                    'reference' => $trx->reference_no,
                    'type' => $trx->type,
                    'warehouse' => $trx->warehouse->name,
                    'user' => $trx->user->name,
                    'date' => $trx->created_at,
                ];
            });

        return Inertia::render('dashboard', [
            'metrics' => [
                'valuation' => $totalValuation,
                'total_products' => $totalProducts,
                'total_warehouses' => $totalWarehouses,
                'total_stock' => $totalStock,
            ],
            'chart_data' => $trendData,
            'warehouses_map' => $warehouses,
            'recent_activities' => $recentActivities
        ]);
    }
}