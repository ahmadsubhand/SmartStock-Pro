import { Head, useForm, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface TransferItem {
  product_id: string;
  qty: number | string;
}

export default function TransferCreate({
  warehouses,
  products,
}: {
  warehouses: Warehouse[];
  products: Product[];
}) {
  function logTime() {
    return Date.now();
  }

  const { data, setData, post, processing, errors } = useForm({
    from_warehouse_id: '',
    to_warehouse_id: '',
    reference_no: `TRF-${logTime}`,
    items: [] as TransferItem[],
  });

  // Auto-generate nomor referensi khusus Transfer (TRF)
  useEffect(() => {
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    setData(
      'reference_no',
      `TRF-${Date.now().toString().slice(-6)}-${randomStr}`,
    );
  }, [setData]);

  const addItem = () => {
    setData('items', [...data.items, { product_id: '', qty: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof TransferItem,
    value: any,
  ) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (data.items.length === 0) {
      alert('Silakan tambahkan setidaknya 1 barang untuk ditransfer.');

      return;
    }

    if (data.from_warehouse_id === data.to_warehouse_id) {
      alert('Gudang asal dan tujuan tidak boleh sama!');
      
      return;
    }
    
    post('/admin/transfers');
  };

  return (
    <div className="p-8 pb-20">
      <Head title="Buat Transfer Barang" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.get('/admin/transfers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kirim Barang Antar Gudang</h1>
            <p className="text-sm text-gray-500">
              Pindahkan stok dari satu gudang ke gudang lainnya.
            </p>
          </div>
        </div>
        <Button
          onClick={submit}
          disabled={processing || data.items.length === 0}
        >
          <Truck className="mr-2 h-4 w-4" /> Proses Pengiriman
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b pb-2 text-lg font-semibold">
            Informasi Rute Pengiriman
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label>Nomor Surat Jalan (Referensi)</Label>
              <Input
                className={`mt-1 ${errors.reference_no ? 'border-red-500' : ''}`}
                value={data.reference_no}
                onChange={(e) => setData('reference_no', e.target.value)}
              />
              {errors.reference_no && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.reference_no}
                </p>
              )}
            </div>

            <div>
              <Label>Dari Gudang (Asal)</Label>
              <Select
                value={data.from_warehouse_id}
                onValueChange={(val) => setData('from_warehouse_id', val)}
              >
                <SelectTrigger
                  className={`mt-1 ${errors.from_warehouse_id ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Pilih Gudang Asal" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id.toString()}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.from_warehouse_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.from_warehouse_id}
                </p>
              )}
            </div>

            <div>
              <Label>Ke Gudang (Tujuan)</Label>
              <Select
                value={data.to_warehouse_id}
                onValueChange={(val) => setData('to_warehouse_id', val)}
              >
                <SelectTrigger
                  className={`mt-1 ${errors.to_warehouse_id ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Pilih Gudang Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id.toString()}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_warehouse_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.to_warehouse_id}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">
              Daftar Barang yang Dikirim
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Baris
            </Button>
          </div>

          {errors.items && (
            <p className="mb-4 text-sm text-red-500">{errors.items}</p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk (SKU - Nama)</TableHead>
                <TableHead className="w-50">Kuantitas (Qty)</TableHead>
                <TableHead className="w-20 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-gray-500"
                  >
                    Belum ada barang. Klik "Tambah Baris" untuk memulai.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.product_id}
                        onValueChange={(val) =>
                          handleItemChange(index, 'product_id', val)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[`items.${index}.product_id`]
                              ? 'border-red-500'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Cari & Pilih Produk..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((prod) => (
                            <SelectItem
                              key={prod.id}
                              value={prod.id.toString()}
                            >
                              [{prod.sku}] - {prod.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`items.${index}.product_id`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`items.${index}.product_id`]}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, 'qty', e.target.value)
                        }
                        className={
                          errors[`items.${index}.qty`] ? 'border-red-500' : ''
                        }
                      />
                      {errors[`items.${index}.qty`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`items.${index}.qty`]}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </form>
    </div>
  );
}
