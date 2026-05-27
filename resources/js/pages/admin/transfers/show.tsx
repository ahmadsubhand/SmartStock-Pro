import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, Truck, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
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

// Tipe Data
interface Warehouse {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface TransferDetail {
  id: number;
  product: Product;
  qty: number;
  unit_cost: string; // Tipe decimal dari database
}

interface Transfer {
  id: number;
  reference_no: string;
  status: 'pending' | 'in_transit' | 'completed' | 'failed';
  shipped_at: string | null;
  received_at: string | null;
  created_at: string;
  from_warehouse: Warehouse;
  to_warehouse: Warehouse;
  user: { name: string };
  details: TransferDetail[];
}

export default function TransferShow({ transfer }: { transfer: Transfer }) {
  // Format Tanggal
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return '-';
    }

    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Format Rupiah
  const formatRupiah = (angka: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(angka));
  };

  // Hitung Total Nilai Aset yang Ditransfer (Berdasarkan HPP FIFO)
  const totalValue = transfer.details.reduce((total, item) => {
    return total + (item.qty * Number(item.unit_cost));
  }, 0);

  return (
    <div className="p-8 pb-20">
      <Head title={`Detail Transfer - ${transfer.reference_no}`} />

      {/* HEADER NAVIGASI */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/transfers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Surat Jalan Transfer Internal</h1>
            <p className="text-sm text-gray-500">{transfer.reference_no}</p>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Surat Jalan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* KOLOM KIRI: INFO RUTE & STATUS */}
        <div className="space-y-6 md:col-span-1">
          
          {/* Card Status */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold">Status Pengiriman</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Status Saat Ini</p>
                <div className="mt-1">
                  {transfer.status === 'in_transit' ? (
                    <Badge className="bg-amber-500 text-sm py-1 px-3">Dalam Perjalanan (In Transit)</Badge>
                  ) : transfer.status === 'completed' ? (
                    <Badge className="bg-emerald-500 text-sm py-1 px-3 flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Selesai (Completed)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm py-1 px-3">{transfer.status.toUpperCase()}</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-500" /> Waktu Dikirim
                </p>
                <p className="mt-1 font-medium">{formatDate(transfer.shipped_at || transfer.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Waktu Diterima
                </p>
                <p className="mt-1 font-medium">
                  {transfer.received_at ? formatDate(transfer.received_at) : (
                    <span className="text-gray-400 italic">Belum diterima</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Card Rute Logistik */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold">Rute Logistik</h2>
            <div className="space-y-6 text-sm">
              <div className="relative border-l-2 border-dashed border-gray-300 pl-6 ml-2">
                
                {/* Node Gudang Asal */}
                <div className="mb-6 relative">
                  <div className="absolute -left-9.5 top-0 rounded-full bg-white p-1 border-2 border-red-500">
                    <MapPin className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500">Dikirim Dari (Asal)</p>
                  <p className="font-bold text-gray-800 text-base">{transfer.from_warehouse.name}</p>
                </div>
                
                {/* Node Gudang Tujuan */}
                <div className="relative">
                  <div className="absolute -left-9.5 top-0 rounded-full bg-white p-1 border-2 border-emerald-500">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-gray-500">Tujuan Pengiriman</p>
                  <p className="font-bold text-gray-800 text-base">{transfer.to_warehouse.name}</p>
                </div>

              </div>

              <div className="pt-4 border-t">
                <p className="text-gray-500">Diproses Oleh (Admin Pengirim)</p>
                <p className="mt-1 flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-gray-500" />
                  {transfer.user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: RINCIAN BARANG */}
        <div className="md:col-span-2">
          <div className="flex h-full flex-col rounded-md border bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold">Daftar Barang (Manifest)</h2>
            
            {transfer.status === 'in_transit' && (
              <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-100 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <p>
                  Barang-barang ini telah dipotong dari stok <strong>{transfer.from_warehouse.name}</strong> dan saat ini sedang dalam perjalanan. 
                  Stok di <strong>{transfer.to_warehouse.name}</strong> baru akan bertambah setelah penerimaan dikonfirmasi.
                </p>
              </div>
            )}

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-center">Kuantitas</TableHead>
                    <TableHead className="text-right">HPP Satuan</TableHead>
                    <TableHead className="text-right">Subtotal HPP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.details.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product.sku}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="text-center font-semibold">{item.qty}</TableCell>
                      <TableCell className="text-right text-gray-500">
                        {formatRupiah(item.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(item.qty * Number(item.unit_cost))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* TOTAL RINGKASAN */}
            <div className="mt-auto pt-6 flex justify-end">
              <div className="w-1/2 rounded-md border bg-gray-50 p-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Nilai Aset:</span>
                  <span className="text-blue-600">{formatRupiah(totalValue)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-gray-500">
                  *Total nilai barang yang dipindahkan berdasarkan perhitungan HPP FIFO.
                </p>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}