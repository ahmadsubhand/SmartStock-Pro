import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

export default function SupplierIndex({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setData({
      name: supplier.name,
      contact_person: supplier.contact_person,
      email: supplier.email || '',
      phone: supplier.phone,
      address: supplier.address,
    });
    setIsOpen(true);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (editingSupplier) {
      put(`/admin/suppliers/${editingSupplier.id}`, {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingSupplier(null);
        },
      });
    } else {
      post('/admin/suppliers', {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const deleteSupplier = (id: number) => {
    if (confirm('Yakin ingin menghapus supplier ini?')) {
      router.delete(`/admin/suppliers/${id}`);
    }
  };

  return (
    <div className="p-8">
      <Head title="Master Supplier" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Supplier</h1>
          <p className="text-sm text-gray-500">
            Kelola data vendor dan pemasok barang Anda.
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);

            if (!open) {
              reset();
              setEditingSupplier(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Nama Perusahaan / Supplier</Label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={data.contact_person}
                    onChange={(e) => setData('contact_person', e.target.value)}
                    className={errors.contact_person ? 'border-red-500' : ''}
                  />
                  {errors.contact_person && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contact_person}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Nomor Telepon</Label>
                  <Input
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Email (Opsional)</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <Label>Alamat Lengkap</Label>
                <Textarea
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={processing}>
                {editingSupplier ? 'Update Data' : 'Simpan Supplier'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Supplier</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supp) => (
              <TableRow key={supp.id}>
                <TableCell className="font-semibold">{supp.name}</TableCell>
                <TableCell>{supp.contact_person}</TableCell>
                <TableCell>{supp.phone}</TableCell>
                <TableCell className="max-w-50 truncate text-gray-500">
                  {supp.address}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditModal(supp)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSupplier(supp.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}