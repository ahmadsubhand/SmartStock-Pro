import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoryIndex({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: '',
    description: '',
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // Fungsi untuk membuka modal edit
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setData({ name: category.name, description: category.description });
    setIsOpen(true);
  };

  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (editingCategory) {
      put(`/admin/categories/${editingCategory.id}`, {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingCategory(null);
        },
      });
    } else {
      post('/admin/categories', {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const deleteCategory = (id: number) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      router.delete(`/admin/categories/${id}`);
    }
  };

  return (
    <div className="p-8">
      <Head title="Master Kategori" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Master Kategori</h1>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);

            if (!open) {
              reset();
              setEditingCategory(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Tambah Kategori</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Nama Kategori</Label>
                <Input 
                  value={data.name} 
                  onChange={e => setData('name', e.target.value)} 
                  // Tambahkan class border-red-500 jika ada error
                  className={errors.name ? 'border-red-500' : ''} 
                />
                {/* Menampilkan pesan error dari Laravel */}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label>Deskripsi</Label>
                <Input 
                  value={data.description} 
                  onChange={e => setData('description', e.target.value)} 
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              <Button type="submit" disabled={processing}>
                {editingCategory ? 'Update' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEditModal(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
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