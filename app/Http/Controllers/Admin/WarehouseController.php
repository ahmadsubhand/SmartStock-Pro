<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/warehouses/index', [
            'warehouses' => Warehouse::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        Warehouse::create($validated);
        return redirect()->back()->with('success', 'Gudang berhasil ditambahkan.');
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        $warehouse->update($validated);
        return redirect()->back()->with('success', 'Data gudang berhasil diperbarui.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return redirect()->back()->with('success', 'Gudang berhasil dihapus.');
    }
}