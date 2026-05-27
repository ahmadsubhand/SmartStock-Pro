import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, FileText, Package, User, MapPin } from 'lucide-react';
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
interface Product {
  id: number;
  sku: string;
  name: string;
}

interface TransactionDetail {
  id: number;
  product: Product;
  qty: number;
  unit_cost: string; // Tipe string dari decimal database, perlu di-parse
}

interface Transaction {
  id: number;
  reference_no: string;
  type: 'in' | 'out';
  status: string;
  transaction_date: string;
  created_at: string;
  notes: string | null;
  warehouse: { name: string };
  supplier: { name: string } | null;
  user: { name: string };
  details: TransactionDetail[];
}

export default function TransactionShow({ transaction }: { transaction: Transaction }) {
  // Format Tanggal
  const formatDate = (dateString: string) => {
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

  // Hitung Total Nilai Transaksi
  const totalValue = transaction.details.reduce((total, item) => {
    return total + (item.qty * Number(item.unit_cost));
  }, 0);

  return (
    <div className="p-8 pb-20">
      <Head title={`Detail Transaksi - ${transaction.reference_no}`} />

      {/* HEADER NAVIGASI */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/transactions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Transaksi</h1>
            <p className="text-sm text-gray-500">{transaction.reference_no}</p>
          </div>
        </div>
        
        {/* Tombol Print (Bisa dikembangkan nanti pakai window.print()) */}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Dokumen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: INFO TRANSAKSI */}
        <div className="md:col-span-1 space-y-6">
          {/* Card Status & Info Umum */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Informasi Umum</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Nomor Referensi</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {transaction.reference_no}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tipe Transaksi</p>
                <div className="mt-1">
                  {transaction.type === 'in' ? (
                    <Badge className="bg-emerald-500">Barang Masuk (Inbound)</Badge>
                  ) : (
                    <Badge className="bg-orange-500">Barang Keluar (Outbound)</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Waktu Proses</p>
                <p className="font-medium mt-1">{formatDate(transaction.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <Badge variant="outline" className="mt-1 border-green-500 text-green-600">
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Card Entitas (Gudang, User, Supplier) */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Pihak Terkait</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Lokasi Gudang</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {transaction.warehouse.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Diproses Oleh (Kasir/Admin)</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                  {transaction.user.name}
                </p>
              </div>
              {transaction.supplier && (
                <div>
                  <p className="text-gray-500">Pemasok (Supplier)</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-indigo-500" />
                    {transaction.supplier.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: RINCIAN BARANG */}
        <div className="md:col-span-2">
          <div className="rounded-md border bg-white p-6 shadow-sm h-full">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Daftar Barang (Item Details)</h2>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>SKU</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-center">Kuantitas</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.details.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product.sku}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="text-center font-semibold">{item.qty}</TableCell>
                      {/* Harga Satuan: Jika Inbound = Harga Beli. Jika Outbound = HPP (Harga Pokok Penjualan) */}
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
            <div className="mt-6 flex justify-end">
              <div className="w-1/2 rounded-md border bg-gray-50 p-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Nilai:</span>
                  <span className="text-blue-600">{formatRupiah(totalValue)}</span>
                </div>
                {transaction.type === 'out' && (
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    *Nilai berdasarkan perhitungan Harga Pokok Penjualan (HPP) FIFO.
                  </p>
                )}
              </div>
            </div>
            
            {transaction.notes && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700">Catatan Tambahan:</p>
                <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-100">
                  {transaction.notes}
                </div>
              </div>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  );
}