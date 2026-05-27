import { Head, router, Link } from '@inertiajs/react';
import { Plus, Search, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Interfaces...
interface Warehouse { name: string; }
interface User { name: string; }
interface Transfer {
  id: number;
  reference_no: string;
  status: 'pending' | 'in_transit' | 'completed' | 'failed';
  shipped_at: string;
  created_at: string;
  from_warehouse: Warehouse;
  to_warehouse: Warehouse;
  user: User;
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
  total: number;
}

export default function TransferIndex({
  transfers,
  filters,
}: {
  transfers: PaginatedData<Transfer>;
  filters: any;
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/transfers', {
        search: searchTerm,
        status: selectedStatus === 'all' ? null : selectedStatus,
      }, { preserveState: true, replace: true });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedStatus]);

  // Fungsi FASE 2: Menerima Barang
  const handleReceive = (id: number, refNo: string) => {
    if (confirm(`Konfirmasi penerimaan surat jalan ${refNo}?\n\nDengan menekan OK, stok di Gudang Tujuan akan otomatis bertambah.`)) {
      router.patch(`/admin/transfers/${id}/receive`, {}, {
        preserveScroll: true,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      <Head title="Transfer Antar Gudang" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transfer Antar Gudang</h1>
          <p className="text-sm text-gray-500">Pantau pergerakan pengiriman stok internal.</p>
        </div>
        <Link href="/admin/transfers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Pengiriman Baru
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Cari Nomor Referensi (TRF-...)"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="in_transit">Di Perjalanan (In Transit)</SelectItem>
            <SelectItem value="completed">Selesai (Completed)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Referensi</TableHead>
              <TableHead>Rute Gudang</TableHead>
              <TableHead>Admin Pengirim</TableHead>
              <TableHead>Waktu Kirim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.data.length > 0 ? transfers.data.map((trf) => (
              <TableRow key={trf.id}>
                <TableCell className="font-medium">{trf.reference_no}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    {trf.from_warehouse.name} 
                    <ArrowRight className="h-4 w-4 text-blue-500" /> 
                    {trf.to_warehouse.name}
                  </div>
                </TableCell>
                <TableCell>{trf.user.name}</TableCell>
                <TableCell>{formatDate(trf.shipped_at || trf.created_at)}</TableCell>
                <TableCell>
                  {trf.status === 'in_transit' ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600">IN TRANSIT</Badge>
                  ) : trf.status === 'completed' ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">COMPLETED</Badge>
                  ) : (
                    <Badge variant="outline">{trf.status.toUpperCase()}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {/* Tombol Terima hanya muncul jika status masih in_transit */}
                  {trf.status === 'in_transit' && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleReceive(trf.id, trf.reference_no)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Terima
                    </Button>
                  )}
                  
                  <Link href={`/admin/transfers/${trf.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Tidak ada data transfer yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginasi bisa disalin dari file index.tsx sebelumnya... */}
    </div>
  );
}