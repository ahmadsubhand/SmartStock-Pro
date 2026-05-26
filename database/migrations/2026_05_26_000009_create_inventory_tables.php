<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel utama untuk logic FIFO/LIFO
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->integer('original_qty');
            $table->integer('remaining_qty');
            $table->decimal('unit_cost', 15, 2);
            $table->timestamps();
        });

        // Materialized view / tabel agregat untuk read/dashboard
        Schema::create('stock_summaries', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->integer('total_qty')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Composite primary key
            $table->primary(['product_id', 'warehouse_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_summaries');
        Schema::dropIfExists('inventory_batches');
    }
};