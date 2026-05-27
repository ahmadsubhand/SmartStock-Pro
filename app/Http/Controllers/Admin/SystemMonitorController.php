<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SystemMonitorController extends Controller
{
    public function index()
    {
        // 1. Ambil Metrik Sistem Dasar (Aman untuk Linux & MacOS)
        $cpuLoad = function_exists('sys_getloadavg') ? sys_getloadavg()[0] : 0;
        $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2); // dalam MB
        
        // Cek sisa disk space (dalam Gigabyte)
        $diskFree = function_exists('disk_free_space') ? round(disk_free_space(base_path()) / 1024 / 1024 / 1024, 2) : 0;
        $diskTotal = function_exists('disk_total_space') ? round(disk_total_space(base_path()) / 1024 / 1024 / 1024, 2) : 1;
        $diskUsagePercentage = $diskTotal > 0 ? round((($diskTotal - $diskFree) / $diskTotal) * 100, 2) : 0;

        // 2. Baca 50 baris terakhir dari laravel.log (Error Log)
        $logPath = storage_path('logs/laravel.log');
        $errorLogs = [];
        if (File::exists($logPath)) {
            // Membaca file log dari belakang menggunakan perintah tail (Linux/Mac)
            // Jika Anda menggunakan Windows, ini mungkin tidak berjalan, kita gunakan fallback
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $lines = file($logPath);
                $errorLogs = array_slice($lines, -50);
            } else {
                exec('tail -n 50 ' . escapeshellarg($logPath), $errorLogs);
            }
            
            // Bersihkan dan format log
            $errorLogs = array_reverse(array_filter($errorLogs));
        }

        // 3. Ambil data Audit Log (Aktivitas User)
        $auditLogs = AuditLog::with('user')
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'subject_type' => class_basename($log->auditable_type),
                    'user' => $log->user?->name ?? 'System',
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->format('d M Y H:i:s'),
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                ];
            });

        return Inertia::render('admin/system/monitor', [
            'metrics' => [
                'cpu_load' => $cpuLoad,
                'memory_usage_mb' => $memoryUsage,
                'disk_free_gb' => $diskFree,
                'disk_usage_percent' => $diskUsagePercentage,
            ],
            'error_logs' => $errorLogs,
            'audit_logs' => $auditLogs,
        ]);
    }
}