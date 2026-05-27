<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter dari URL (Inertia Frontend)
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $sortField = $request->input('sort_field', 'created_at'); // Default sort
        $sortDir = $request->input('sort_direction', 'desc');

        // 2. Query Builder dengan Optimasi (Eager Loading)
        $products = Product::with(['category', 'images'])
            // Filter Pencarian (SKU atau Nama)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $searchTerm = strtolower($search);
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereRaw('LOWER(sku) LIKE ?', ["%{$searchTerm}%"]);
                });
            })
            // Filter berdasarkan Kategori
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            // Sorting Dinamis
            ->orderBy($sortField, $sortDir)
            // 3. Paginasi (Misal 10 data per halaman)
            ->paginate(10)
            // withQueryString() sangat krusial agar saat pindah halaman (page=2), 
            // parameter search dan filter tidak hilang dari URL.
            ->withQueryString(); 

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => Category::all(),
            // Kirim balik filter saat ini agar UI frontend tetap sinkron
            'filters' => $request->only(['search', 'category_id', 'sort_field', 'sort_direction'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'min_stock_level' => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => $index === 0, // Gambar pertama otomatis jadi primary
                ]);
            }
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'min_stock_level' => 'required|integer|min:0',
        ]);

        $product->update($validated);

        if ($request->hasFile('images')) {
            $hasPrimary = $product->images()->where('is_primary', true)->exists();

            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => !$hasPrimary && $index === 0, 
                ]);
            }
        }

        return redirect()->back()->with('success', 'Data produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }

    public function destroyImage(ProductImage $image)
    {
        $product = $image->product;
        $wasPrimary = $image->is_primary;

        // 1. Hapus file fisik dari storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        if ($wasPrimary) {
            $nextImage = $product->images()->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return redirect()->back()->with('success', 'Gambar berhasil dihapus.');
    }

    // ... method update & destroy mirip dengan warehouse ...
}