import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, ShieldCheck, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
  roles: Role[];
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  role: string;
  sort_field: string;
  sort_direction: string;
}

export default function UserIndex({
  users,
  roles,
  filters,
}: {
  users: PaginatedData<User>;
  roles: Role[];
  filters: Filters;
}) {
  const { auth } = usePage().props;
  const canCreateAdmin = auth.user.id === 1;

  // STATE UNTUK FILTER & SORTING
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedRole, setSelectedRole] = useState(filters?.role || 'all');
  const [sortField, setSortField] = useState(filters?.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'desc');
  
  // Mencegah request pada render pertama
  const isMounted = useRef(false);

  // --- STATE MODAL & FORM ---
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    role_id: '',
  });

  // OPTIMASI: Efek Debounce untuk Pencarian & Filter
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/users', {
        search: searchTerm,
        role: selectedRole === 'all' ? null : selectedRole,
        sort_field: sortField,
        sort_direction: sortDir,
      }, {
        preserveState: true, 
        preserveScroll: true, 
        replace: true, 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedRole, sortField, sortDir]);

  // Fungsi untuk menangani klik header tabel (Sorting)
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // --- FUNGSI KONTROL MODAL ---
  const openAddModal = () => {
    reset();
    clearErrors();
    setEditingUser(null);
    setIsOpen(true);
  };

  const openEditModal = (user: User) => {
    clearErrors();
    setEditingUser(user);
    // Asumsi 1 user memiliki 1 role utama untuk form edit
    const currentRoleId = user.roles.length > 0 ? user.roles[0].id.toString() : '';
    
    setData({
      name: user.name,
      email: user.email,
      role_id: currentRoleId,
    });
    setIsOpen(true);
  };

  // --- SUBMIT FORM (CREATE / UPDATE) ---
  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (editingUser) {
      put(`/admin/users/${editingUser.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingUser(null);
        },
      });
    } else {
      post('/admin/users', {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const deleteUser = (id: number) => {
    if (confirm('Yakin ingin menghapus pengguna ini? Semua data terkait (kecuali riwayat transaksi) mungkin terpengaruh.')) {
      router.delete(`/admin/users/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="p-8">
      <Head title="Kelola Pengguna" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
          <p className="text-sm text-gray-500">Daftar staf, manajer, dan akses sistem lainnya.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>

        {/* --- MODAL TAMBAH / EDIT --- */}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            reset(); 
            setEditingUser(null); 
            clearErrors();
          } 
        }}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={submit} className="flex flex-col gap-6 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                  <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@perusahaan.com"
                    required
                    disabled={!!editingUser} // Mencegah edit email jika diinginkan (opsional)
                  />
                  <InputError message={errors.email} />
                  {editingUser && (
                    <span className="text-[10px] text-gray-400 -mt-1">
                      *Alamat email tidak dapat diubah setelah pendaftaran.
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role_id">Role / Peran</Label>
                  <Select
                    value={data.role_id}
                    onValueChange={(val) => setData('role_id', val)}
                    required
                  >
                    <SelectTrigger id="role_id">
                      <SelectValue placeholder="Pilih hak akses" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        // Jika user bukan Super Admin, sembunyikan pilihan 'admin' dari dropdown
                        (role.name !== 'admin' || canCreateAdmin) && (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.role_id} />
                </div>
              </div>

              <Button type="submit" disabled={processing} className="w-full">
                {processing && <Spinner />}
                {editingUser ? 'Simpan Perubahan' : 'Buat Akun & Kirim Email'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BARIS OPTIMASI FILTER & PENCARIAN */}
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Cari Nama atau Email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex max-w-xs items-center space-x-2">
          <Select 
            value={selectedRole} 
            onValueChange={setSelectedRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Peran (Role)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-1/4" 
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Pengguna <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('last_login_at')}
              >
                <div className="flex items-center">
                  Login Terakhir <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.data.length > 0 ? users.data.map((user) => (
              <TableRow key={user.id}>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span key={role.id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  {user.is_active ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <Clock className="mr-1 h-3 w-3" /> Menunggu Aktivasi
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-gray-500 text-sm">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '-'}
                </TableCell>

                <TableCell className="space-x-2 text-right">
                  {/* Tombol Hapus: Muncul jika bukan admin, ATAU jika yang login adalah Super Admin */}
                  {(!user.roles.some(r => r.name === 'admin') || auth.user.id === 1) && user.id !== auth.user.id && (
                    <>
                      <Button variant="outline" size="icon" onClick={() => openEditModal(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </TableCell>

              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Data pengguna tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* KOMPONEN PAGINATION SEDERHANA */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan Halaman {users.current_page} dari {users.last_page}
        </p>
        <div className="flex space-x-2">
          {users.links.map((link, index) => (
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