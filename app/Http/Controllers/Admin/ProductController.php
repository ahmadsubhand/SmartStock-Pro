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
    public function index()
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::with('category', 'images')->latest()->get(),
            'categories' => Category::all()
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