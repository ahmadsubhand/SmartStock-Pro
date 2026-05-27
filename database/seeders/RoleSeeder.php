<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'manager', 'guard_name' => 'web'],
            ['name' => 'staff', 'guard_name' => 'web'],
            ['name' => 'viewer', 'guard_name' => 'web'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']], // unique key
                $role
            );
        }
    }
}