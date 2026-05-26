<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserActivationMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'required|exists:roles,id',
        ]);

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

    public function create()
    {
        // Ambil data role untuk ditampilkan di dropdown (kecuali jika ada role khusus yang disembunyikan)
        $roles = Role::select(['id', 'name'])->get();

        // Mengarahkan ke file resources/js/pages/admin/users/create.tsx
        return Inertia::render('admin/users/create', [
            'roles' => $roles
        ]);
    }
}