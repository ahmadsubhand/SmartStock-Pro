<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserActivationMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter dari URL (Inertia Frontend)
        $search = $request->input('search');
        $roleName = $request->input('role');
        $sortField = $request->input('sort_field', 'created_at'); // Default sort
        $sortDir = $request->input('sort_direction', 'desc');

        // 2. Query Builder dengan Optimasi (Eager Loading)
        $users = User::with(['roles'])
            // Filter Pencarian (Nama atau Email)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $searchTerm = strtolower($search);
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereRaw('LOWER(email) LIKE ?', ["%{$searchTerm}%"]);
                });
            })
            // Filter berdasarkan Peran (Role)
            ->when($roleName, function ($query, $roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('name', $roleName);
                });
            })
            // Sorting Dinamis
            ->orderBy($sortField, $sortDir)
            // 3. Paginasi (Misal 10 data per halaman)
            ->paginate(10)
            // withQueryString() sangat krusial agar saat pindah halaman (page=2), 
            // parameter search dan filter tidak hilang dari URL.
            ->withQueryString(); 

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => Role::all(), // Mengambil semua role untuk dropdown filter di UI
            // Kirim balik filter saat ini agar UI frontend tetap sinkron
            'filters' => $request->only(['search', 'role', 'sort_field', 'sort_direction'])
        ]);
    }    

    public function store(Request $request)
    {
        // 1. Validasi awal
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'required|exists:roles,id',
        ]);

        // 2. Ambil data role yang dipilih
        $role = Role::find($validated['role_id']);

        // 3. Proteksi: Jika mencoba membuat akun 'admin', 
        // pastikan yang login adalah Super Admin (ID 1)
        if ($role->name === 'admin' && Auth::id() !== 1) {
            return redirect()->back()->with('error', 'Anda tidak memiliki wewenang untuk membuat akun Admin.');
        }

        // Simpan hasil return dari DB::transaction ke dalam variabel $user
        $user = DB::transaction(function () use ($validated) {
            $createdUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                // Set password acak sementara agar tidak bisa dilogin sebelum diaktivasi
                'password' => Hash::make(Str::random(32)),
                'is_active' => false, 
            ]);

            // Asumsi menggunakan standard pivot tabel yang sudah kita buat
            DB::table('model_has_roles')->insert([
                'role_id' => $validated['role_id'],
                'model_type' => User::class,
                'model_id' => $createdUser->id,
            ]);

            // Return user yang baru dibuat agar keluar dari scope transaction
            return $createdUser;
        });

        // Sekarang IDE akan mengenali $user sebagai object User yang valid
        // Kirim email (menggunakan queue agar tidak menghalangi response UI)
        Mail::to($user->email)->queue(new UserActivationMail($user));

        return redirect()->back()->with('success', 'Akun berhasil dibuat. Email aktivasi telah dikirim.');
    }

    public function update(Request $request, User $user)
    {
        // 1. Cek apakah yang sedang login adalah Super Admin (ID 1)
        $isSuperAdmin = Auth::id() === 1;

        // 2. Cek apakah user yang mau diedit adalah seorang Admin
        $targetIsAdmin = $user->hasRole('admin');

        // 3. Proteksi: Jika user yang diedit adalah Admin, 
        // maka hanya Super Admin yang boleh melakukannya.
        if ($targetIsAdmin && !$isSuperAdmin) {
            return redirect()->back()->with('error', 'Anda tidak memiliki wewenang untuk mengubah data Admin.');
        }

        // 4. Proteksi tambahan: Super Admin tidak bisa diubah
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengubah akun Anda sendiri.');
        }

        // 1. Validasi Input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role_id' => 'required|exists:roles,id',
        ]);

        // 2. Update Data menggunakan Transaksi
        DB::transaction(function () use ($user, $validated) {
            // Update profil user
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Update Role: Hapus role lama, pasang role baru
            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->delete();

            DB::table('model_has_roles')->insert([
                'role_id' => $validated['role_id'],
                'model_type' => User::class,
                'model_id' => $user->id,
            ]);
        });

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $isSuperAdmin = Auth::id() === 1;
        $targetIsAdmin = $user->hasRole('admin');

        // Proteksi: Mencegah penghapusan admin oleh admin lain
        if ($targetIsAdmin && !$isSuperAdmin) {
            return redirect()->back()->with('error', 'Anda tidak memiliki wewenang untuk menghapus akun Admin.');
        }

        // Proteksi tambahan: Super Admin tidak boleh menghapus dirinya sendiri
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        DB::transaction(function () use ($user) {
            // Hapus relasi role terlebih dahulu
            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->delete();
            
            // Hapus user
            $user->delete();
        });

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}