<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'warehouse_id', 'total_qty'])]
class StockSummary extends Model
{
    // Menggunakan composite primary key
    protected $primaryKey = ['product_id', 'warehouse_id'];
    public $incrementing = false;
    public const CREATED_AT = null; // Hanya ada updated_at di tabel

    protected function casts(): array
    {
        return [
            'total_qty' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Override fungsi bawaan Laravel agar mendukung Composite Primary Key
     * saat memanggil fungsi save(), update(), increment(), atau decrement().
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query->where('product_id', $this->getAttribute('product_id'))
            ->where('warehouse_id', $this->getAttribute('warehouse_id'));
    }
}