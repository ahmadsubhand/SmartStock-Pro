import { Head, router } from '@inertiajs/react';
import { Activity, Cpu, HardDrive, ShieldAlert, History, RefreshCw, Server } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Metrics {
  cpu_load: number;
  memory_usage_mb: number;
  disk_free_gb: number;
  disk_usage_percent: number;
}

interface AuditLog {
  id: number;
  event: string;
  subject_type: string | null;
  user: string;
  ip_address: string | null;
  created_at: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}

export default function SystemMonitor({
  metrics,
  error_logs,
  audit_logs
}: {
  metrics: Metrics;
  error_logs: string[];
  audit_logs: AuditLog[];
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['metrics', 'error_logs', 'audit_logs'],
      onFinish: () => setIsRefreshing(false)
    });
  };

  return (
    <div className="p-8 pb-20">
      <Head title="System Monitor & Logs" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-gray-700" />
            System Monitor & Telemetry
          </h1>
          <p className="text-sm text-gray-500">Pantau kesehatan server, log error, dan audit aktivitas pengguna.</p>
        </div>
        <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* 1. KARTU METRIK SERVER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">CPU Load (1m)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metrics.cpu_load}</p>
          <p className="text-xs text-gray-500 mt-1">Indikator beban prosesor</p>
        </div>

        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Memory Usage (PHP)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metrics.memory_usage_mb} <span className="text-lg text-gray-500">MB</span></p>
          <p className="text-xs text-gray-500 mt-1">Memori yang dialokasikan saat ini</p>
        </div>

        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <HardDrive className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Disk Usage</h3>
          </div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-3xl font-bold text-gray-800">{metrics.disk_usage_percent}%</p>
            <p className="text-sm text-gray-500">{metrics.disk_free_gb} GB Free</p>
          </div>
          <Progress value={metrics.disk_usage_percent} className="h-2" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. AUDIT LOGS (Aktivitas User) */}
        <div className="flex h-125 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              
              <div>
                <h2 className="font-semibold text-gray-800">
                  Audit Logs
                </h2>

                <p className="text-xs text-gray-500">
                  Aktivitas terbaru pengguna dan sistem
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              
              {/* Table Head */}
              <thead className="sticky top-0 z-10 border-b bg-white">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-500">
                    Event
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-500">
                    Target
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-500">
                    IP Address
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-500">
                    Waktu
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {audit_logs.length > 0 ? (
                  audit_logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b transition hover:bg-gray-50"
                    >
                      
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {log.user}
                          </span>

                          <span className="text-xs text-gray-400">
                            User Activity
                          </span>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full border bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {log.event}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-4 text-gray-600">
                        {log.subject_type || '-'}
                      </td>

                      {/* IP Address */}
                      <td className="px-5 py-4">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {log.ip_address || '-'}
                        </code>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">
                            {log.created_at}
                          </span>

                          <span className="text-xs text-gray-400">
                            Recorded Log
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <History className="mb-3 h-10 w-10" />

                        <p className="font-medium text-gray-500">
                          Belum ada aktivitas
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Audit log sistem akan muncul di sini
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. SYSTEM ERROR LOGS (laravel.log) */}
        <div className="rounded-md border border-red-200 bg-white shadow-sm flex flex-col h-125">
          <div className="p-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-800">System Error Logs (laravel.log)</h2>
          </div>
          <div className="p-4 bg-gray-900 overflow-y-auto flex-1 text-gray-300 font-mono text-xs">
            {error_logs.length > 0 ? error_logs.map((line, index) => {
              // Highlight baris yang mengandung kata ERROR
              const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('exception');

              return (
                <div key={index} className={`mb-1 wrap-break-word ${isError ? 'text-red-400 font-bold' : ''}`}>
                  {line}
                </div>
              );
            }) : (
              <div className="text-emerald-400">Log bersih. Tidak ada pesan error yang ditemukan.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}