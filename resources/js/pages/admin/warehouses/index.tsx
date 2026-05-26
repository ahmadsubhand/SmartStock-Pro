import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import WarehouseMap from '../../../components/warehouse-map';

interface Warehouse {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
}

export default function WarehouseIndex({
    warehouses,
}: {
    warehouses: Warehouse[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
        null,
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        is_active: true,
    });

    const openEditModal = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setData({
            name: warehouse.name,
            address: warehouse.address,
            latitude: warehouse.latitude.toString(),
            longitude: warehouse.longitude.toString(),
            is_active: warehouse.is_active,
        });
        setIsOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingWarehouse) {
            put(`/admin/warehouses/${editingWarehouse.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingWarehouse(null);
                },
            });
        } else {
            post('/admin/warehouses', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteWarehouse = (id: number) => {
        if (confirm('Yakin ingin menghapus gudang ini?')) {
            router.delete(`/admin/warehouses/${id}`);
        }
    };

    return (
        <div className="p-8">
            <Head title="Master Gudang" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Master Gudang</h1>
                    <p className="text-sm text-gray-500">
                        Kelola lokasi penyimpanan inventaris Anda.
                    </p>
                </div>
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open);

                        if (!open) {
                            reset();
                            setEditingWarehouse(null);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Gudang
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingWarehouse
                                    ? 'Edit Gudang'
                                    : 'Tambah Gudang Baru'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label>Nama Gudang</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Alamat Lengkap</Label>
                                <Textarea
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData('latitude', e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData('longitude', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Pilih Lokasi di Peta (Klik Peta)</Label>
                              <WarehouseMap 
                                lat={parseFloat(data.latitude) || 0} 
                                lng={parseFloat(data.longitude) || 0} 
                                onLocationSelect={(lat, lng) => {
                                    setData(d => ({ ...d, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
                                }}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(val) =>
                                        setData('is_active', val)
                                    }
                                />
                                <Label>Gudang Aktif</Label>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {editingWarehouse
                                    ? 'Update Data'
                                    : 'Simpan Gudang'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Koordinat</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.map((wh) => (
                            <TableRow key={wh.id}>
                                <TableCell className="font-semibold">
                                    {wh.name}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {wh.address}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="mr-1 h-3 w-3" />
                                        {wh.latitude}, {wh.longitude}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${wh.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {wh.is_active ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditModal(wh)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteWarehouse(wh.id)}
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
