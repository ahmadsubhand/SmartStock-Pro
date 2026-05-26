<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AccountActivationController extends Controller
{
    public function show(Request $request, User $user)
    {
        if ($user->is_active) {
            return redirect()->route('login')->with('info', 'Akun Anda sudah aktif. Silakan login.');
        }

        return Inertia::render('auth/activate-account', [
            // 'userId' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
        ]);
    }

    public function update(Request $request, User $user)
    {
        if ($user->is_active) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
            'is_active' => true,
            'email_verified_at' => now(), // Opsional jika butuh penanda email valid
        ]);

        return redirect()->route('login')->with('success', 'Password berhasil diatur! Silakan login.');
    }
}