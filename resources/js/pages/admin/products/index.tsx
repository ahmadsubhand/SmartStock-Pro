import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, ImageIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';

interface Category {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
  image_url: string;
}

interface Product {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  description: string;
  min_stock_level: number;
  category: Category;
  images: ProductImage[];
}

export default function ProductIndex({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    category_id: '',
    sku: '',
    name: '',
    description: '',
    min_stock_level: '0',
    images: [] as File[],
    _method: 'post',
  });

  const openAddModal = () => {
    reset();
    setEditingProduct(null);
    setData('_method', 'post');
    setIsOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setData({
      category_id: product.category_id.toString(),
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      min_stock_level: product.min_stock_level.toString(),
      images: [],
      _method: 'put',
    });
    setIsOpen(true);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const url = editingProduct ? `/admin/products/${editingProduct.id}` : '/admin/products';

    post(url, {
      preserveScroll: true,
      onSuccess: () => {
        setIsOpen(false);
        reset();
        setEditingProduct(null);
      },
    });
  };

  const deleteProduct = (id: number) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      router.delete(`/admin/products/${id}`);
    }
  };

  const deleteImage = (imageId: number) => {
    if (confirm('Yakin ingin menghapus gambar ini?')) {
      router.delete(`/admin/product-images/${imageId}`, {
        preserveScroll: true,
        onSuccess: () => {
          setEditingProduct(prev => {
            if (!prev) {
              return prev;
            }
            
            return {
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            };
          });
        }
      });
    }
  };

  return (
    <div className="p-8">
      <Head title="Master Produk" />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Master Produk</h1>
            <p className="text-sm text-gray-500">Kelola katalog barang beserta gambarnya.</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            reset(); setEditingProduct(null); 
          } 
        }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          </DialogHeader>
            {/* Tambahkan encType="multipart/form-data" */}
            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
              <div>
                <Label>Kategori</Label>

                <Select
                  value={data.category_id}
                  onValueChange={(val) =>
                    setData('category_id', val)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.category_id
                        ? 'border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id.toString()}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div>
                <Label>SKU</Label>

                <Input
                  value={data.sku}
                  onChange={(e) =>
                    setData('sku', e.target.value)
                  }
                  className={
                    errors.sku ? 'border-red-500' : ''
                  }
                />

                {errors.sku && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.sku}
                  </p>
                )}
              </div>

              <div>
                <Label>Nama Produk</Label>

                <Input
                  value={data.name}
                  onChange={(e) =>
                    setData('name', e.target.value)
                  }
                  className={
                    errors.name ? 'border-red-500' : ''
                  }
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label>Deskripsi</Label>

                <Textarea
                  value={data.description}
                  onChange={(e) =>
                    setData('description', e.target.value)
                  }
                  className={
                    errors.description
                      ? 'border-red-500'
                      : ''
                  }
                />

                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label>Min Stok Level</Label>

                <Input
                  type="number"
                  value={data.min_stock_level}
                  onChange={(e) =>
                    setData(
                      'min_stock_level',
                      e.target.value,
                    )
                  }
                  className={
                    errors.min_stock_level
                      ? 'border-red-500'
                      : ''
                  }
                />

                {errors.min_stock_level && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.min_stock_level}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <Label>Upload Gambar Produk (Bisa lebih dari 1)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setData('images', Array.from(e.target.files || []))}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WEBP (Max 2MB/file)</p>
                {errors['images.0'] && <p className="mt-1 text-sm text-red-500">{errors['images.0']}</p>}

                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Gambar Saat Ini:</p>
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((img) => (
                    <div key={img.id} className="group relative rounded-md border p-1">
                      <img 
                        src={img.image_url} 
                        alt="product" 
                        className="h-20 w-20 rounded-sm object-cover" 
                      />

                      {img.is_primary && (
                          <span className="absolute -left-2 -top-2 z-10 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white shadow-sm">
                              Primary
                          </span>
                      )}
                      
                      <button
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={processing}
              >
                {editingProduct
                  ? 'Update Data'
                  : 'Simpan Produk'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Gambar</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Min Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>
                  {prod.images.length > 0 ? (
                    <img 
                      src={prod.images.find(img => img.is_primary)?.image_url || prod.images[0].image_url} 
                      alt={prod.name} 
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {prod.sku}
                </TableCell>

                <TableCell>{prod.name}</TableCell>

                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                    {prod.category.name}
                  </span>
                </TableCell>

                <TableCell>
                  {prod.min_stock_level}
                </TableCell>

                <TableCell className="space-x-2 text-right">
                  <Button variant="outline" size="icon" onClick={() => openEditModal(prod)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(prod.id)}>
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