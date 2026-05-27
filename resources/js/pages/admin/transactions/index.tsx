import { Head, router, Link } from '@inertiajs/react';
import { Plus, Search, Eye, ArrowUpDown, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

interface Warehouse {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  reference_no: string;
  type: 'in' | 'out';
  status: string;
  transaction_date: string;
  created_at: string;
  warehouse: Warehouse;
  supplier: Supplier | null;
  user: User;
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function TransactionIndex({
  transactions,
  filters,
}: {
  transactions: PaginatedData<Transaction>;
  filters: any;
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters.sort_direction || 'desc');
  
  const isMounted = useRef(false);

  // Efek Debounce untuk Filter dan Pencarian Server-side
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/transactions', {
        search: searchTerm,
        type: selectedType === 'all' ? null : selectedType,
        sort_field: sortField,
        sort_direction: sortDir,
      }, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedType, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="p-8">
      <Head title="Riwayat Transaksi" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-500">Pantau semua dokumen barang masuk dan keluar.</p>
        </div>
        <Link href="/admin/transactions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Transaksi Baru
          </Button>
        </Link>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Cari Nomor Referensi (TRX-...)"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex w-full max-w-xs items-center space-x-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Tipe Transaksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="in">Barang Masuk (Inbound)</SelectItem>
              <SelectItem value="out">Barang Keluar (Outbound)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABEL DATA TRANSAKSI */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('reference_no')}
              >
                <div className="flex items-center">
                  No. Referensi <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Waktu <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead>Kasir / Admin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.data.length > 0 ? transactions.data.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell className="font-medium text-blue-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {trx.reference_no}
                  </div>
                </TableCell>
                <TableCell>{formatDate(trx.created_at)}</TableCell>
                <TableCell>
                  {trx.type === 'in' ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Inbound</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Outbound</Badge>
                  )}
                </TableCell>
                <TableCell>{trx.warehouse.name}</TableCell>
                <TableCell>{trx.user.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    {trx.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/transactions/${trx.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Tidak ada data transaksi yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINASI BAWAH */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {transactions.data.length} dari {transactions.total} transaksi
        </p>
        <div className="flex space-x-2">
          {transactions.links.map((link, index) => (
            <Button
              key={index}
              variant={link.active ? "default" : "outline"}
              size="sm"
              disabled={!link.url}
              onClick={() => {
                if (link.url) {
                  router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                }
              }}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}