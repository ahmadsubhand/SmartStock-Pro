import { Head, router, useForm } from '@inertiajs/react';
import { FileDown, FileText, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ExportDocument {
  id: number;
  report_name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  user: { name: string };
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
}

export default function ReportIndex({ documents }: { documents: PaginatedData<ExportDocument> }) {
  const { post, processing } = useForm({
    type: 'inventory',
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-polling: Refresh data setiap 5 detik jika ada dokumen yang belum selesai
  useEffect(() => {
    const hasUnfinishedTasks = documents.data.some(
      (doc) => doc.status === 'pending' || doc.status === 'processing'
    );

    let interval: number;

    if (hasUnfinishedTasks) {
      interval = window.setInterval(() => {
        router.visit(window.location.pathname, {
          only: ['documents'],
          preserveScroll: true,
          preserveState: true,
        });
      }, 5000);
    }

    return () => {
      if (interval) { 
        window.clearInterval(interval);
      }
    };
  }, [documents.data]);

  const requestReport = () => {
    post('/admin/reports', {
      preserveScroll: true,
    });
  };

  const manualRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['documents'],
      onFinish: () => setIsRefreshing(false),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      <Head title="Pusat Laporan PDF" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pusat Laporan & Ekspor</h1>
          <p className="text-sm text-gray-500">Minta (*Request*) laporan PDF skala besar dan unduh kapan saja.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={manualRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Perbarui Status
          </Button>
          <Button onClick={requestReport} disabled={processing}>
            <FileText className="mr-2 h-4 w-4" /> Minta Laporan Stok (PDF)
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Laporan</TableHead>
              <TableHead>Waktu Request</TableHead>
              <TableHead>Pemohon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.data.length > 0 ? documents.data.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium text-gray-800">{doc.report_name}</TableCell>
                <TableCell>{formatDate(doc.created_at)}</TableCell>
                <TableCell>{doc.user.name}</TableCell>
                <TableCell>
                  {doc.status === 'pending' && <Badge variant="outline" className="text-gray-500"><Clock className="mr-1 h-3 w-3" /> Mengantre</Badge>}
                  {doc.status === 'processing' && <Badge className="bg-blue-500"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Sedang Dirender</Badge>}
                  {doc.status === 'completed' && <Badge className="bg-emerald-500"><CheckCircle2 className="mr-1 h-3 w-3" /> Selesai</Badge>}
                  {doc.status === 'failed' && <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Gagal</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  {doc.status === 'completed' ? (
                    <a href={`/admin/reports/${doc.id}/download`} download>
                      <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <FileDown className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </a>
                  ) : doc.status === 'failed' ? (
                    <span className="text-xs text-red-500">{doc.error_message?.substring(0, 30)}...</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Mohon tunggu...</span>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Belum ada riwayat pembuatan laporan. Klik "Minta Laporan Stok (PDF)" untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}