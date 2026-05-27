import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
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

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface TransactionItem {
  product_id: string;
  qty: number | string;
  unit_cost: number | string;
}

export default function TransactionCreate({
  warehouses,
  suppliers,
  products,
}: {
  warehouses: Warehouse[];
  suppliers: Supplier[];
  products: Product[];
}) {
  function logTime() {
    return Date.now();
  }

  const { data, setData, post, processing, errors } = useForm({
    type: 'in', // Default
    warehouse_id: '',
    supplier_id: '',
    reference_no: `TRX-${logTime}`,
    items: [] as TransactionItem[],
  });

  // Ganti prefix Reference No jika tipe transaksi berubah
  useEffect(() => {
    const prefix = data.type === 'in' ? 'TRX-IN-' : 'TRX-OUT-';
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    setData(
      'reference_no',
      `${prefix}${Date.now().toString().slice(-6)}-${randomStr}`,
    );

    // Jika outbound, hapus supplier_id agar tidak dikirim ke backend
    if (data.type === 'out') {
      setData('supplier_id', '');
    }
  }, [data.type, setData]);

  useEffect(() => {
    console.log(errors);
  }, [errors])

  // Fungsi Dinamis untuk Keranjang (Items)
  const addItem = () => {
    setData('items', [...data.items, { product_id: '', qty: 1, unit_cost: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof TransactionItem,
    value: any,
  ) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (data.items.length === 0) {
      alert('Silakan tambahkan setidaknya 1 barang ke dalam transaksi.');

      return;
    }

    post('/admin/transactions');
  };

  return (
    <div className="p-8 pb-20">
      <Head title="Buat Transaksi Baru" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.get('/admin/transactions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Transaksi Baru</h1>
            <p className="text-sm text-gray-500">
              Catat pergerakan barang masuk atau keluar.
            </p>
          </div>
        </div>
        <Button
          onClick={submit}
          disabled={processing || data.items.length === 0}
        >
          <Save className="mr-2 h-4 w-4" /> Proses Transaksi
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* BAGIAN 1: HEADER TRANSAKSI */}
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <h2 className="mb-4 border-b pb-2 text-lg font-semibold">
            Informasi Utama
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Tipe Transaksi</Label>
              <Select
                value={data.type}
                onValueChange={(val) => setData('type', val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    Barang Masuk (Inbound)
                  </SelectItem>
                  <SelectItem value="out">
                    Barang Keluar (Outbound)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nomor Referensi</Label>
              <Input
                className={`mt-1 ${errors.reference_no ? 'border-red-500' : ''}`}
                value={data.reference_no}
                onChange={(e) => setData('reference_no', e.target.value)}
              />
              {errors.reference_no && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.reference_no}
                </p>
              )}
            </div>

            <div>
              <Label>Gudang</Label>
              <Select
                value={data.warehouse_id}
                onValueChange={(val) => setData('warehouse_id', val)}
              >
                <SelectTrigger
                  className={`mt-1 ${errors.warehouse_id ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Pilih Gudang" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id.toString()}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouse_id && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.warehouse_id}
                </p>
              )}
            </div>

            {data.type === 'in' && (
              <div>
                <Label>Pemasok (Supplier)</Label>
                <Select
                  value={data.supplier_id}
                  onValueChange={(val) => setData('supplier_id', val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id.toString()}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* BAGIAN 2: RINCIAN BARANG (KERANJANG) */}
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">Rincian Barang</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Baris
            </Button>
          </div>

          {/* Menampilkan error jika array items kosong tapi dikirim */}
          {errors.items && (
            <p className="mb-4 text-sm text-red-500">{errors.items}</p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="w-37.5">Kuantitas (Qty)</TableHead>
                {data.type === 'in' && (
                  <TableHead className="w-50">Harga Beli Satuan (Rp)</TableHead>
                )}
                <TableHead className="w-20 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-gray-500"
                  >
                    Belum ada barang yang ditambahkan. Klik tombol "Tambah
                    Baris".
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
                          <SelectValue placeholder="Pilih Produk" />
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

                    {/* Harga beli hanya muncul saat Inbound. Saat outbound, backend yang hitung otomatis dari FIFO */}
                    {data.type === 'in' && (
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) =>
                            handleItemChange(index, 'unit_cost', e.target.value)
                          }
                          className={
                            errors[`items.${index}.unit_cost`]
                              ? 'border-red-500'
                              : ''
                          }
                        />
                        {errors[`items.${index}.unit_cost`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors[`items.${index}.unit_cost`]}
                          </p>
                        )}
                      </TableCell>
                    )}

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
