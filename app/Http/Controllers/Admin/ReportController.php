<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GeneratePdfReport;
use App\Models\ExportDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Menampilkan daftar riwayat pembuatan laporan
     */
    public function index()
    {
        // Tampilkan riwayat laporan milik semua orang, urutkan dari yang terbaru
        $documents = ExportDocument::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/reports/index', [
            'documents' => $documents
        ]);
    }

    /**
     * Meminta sistem untuk membuat PDF baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:inventory',
        ]);

        $reportName = '';
        if ($request->type === 'inventory') {
            $reportName = 'Laporan Stok Keseluruhan - ' . now()->format('d M Y');
        }

        // 1. Buat record di tabel
        $document = ExportDocument::create([
            'user_id' => Auth::id(),
            'report_name' => $reportName,
            'type' => $request->type,
            'status' => 'pending',
        ]);

        // 2. Lempar tugas ke Background Worker
        GeneratePdfReport::dispatch($document);

        return redirect()->back()->with('success', 'Permintaan ekspor laporan telah masuk antrean. Sistem sedang memproses PDF di latar belakang.');
    }

    /**
     * Mengunduh PDF yang sudah jadi
     */
    public function download(ExportDocument $document)
    {
        // Validasi: Pastikan statusnya completed dan file fisiknya ada
        if ($document->status !== 'completed' || !Storage::disk('public')->exists($document->file_path)) {
            return redirect()->back()->with('error', 'File dokumen tidak ditemukan atau belum selesai diproses.');
        }

        // Paksa browser untuk mendownload (bukan hanya membuka di tab baru)
        return response()->download(
            storage_path('app/public/' . $document->file_path),
            $document->report_name . '.pdf'
        );
    }
}