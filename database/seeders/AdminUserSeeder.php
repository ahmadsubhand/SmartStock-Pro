<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Role Admin jika belum ada
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['guard_name' => 'web']
        );

        // 2. Buat akun User Admin untuk testing
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@wms.test'], // Gunakan email ini untuk login
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'), // Password default testing
                'is_active' => true, // Langsung diaktifkan
                'email_verified_at' => now(),
            ]
        );

        // 3. Hubungkan User dengan Role Admin (jika belum terhubung)
        if (! $adminUser->hasRole('admin')) {
            $adminUser->roles()->attach($adminRole->id, [
                'model_type' => User::class
            ]);
        }

        $this->command->info('Admin user berhasil dibuat! Email: admin@wms.test | Password: password123');
    }
}