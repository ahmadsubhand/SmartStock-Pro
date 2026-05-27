<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            // Ubah transaction_id menjadi nullable
            $table->foreignId('transaction_id')
                ->nullable()
                ->change();

            // Tambahkan transfer_id nullable
            $table->foreignId('transfer_id')
                ->nullable()
                ->after('transaction_id')
                ->constrained('transfers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            // Hapus foreign key transfer_id terlebih dahulu
            $table->dropForeign(['transfer_id']);
            $table->dropColumn('transfer_id');

            // Kembalikan transaction_id menjadi NOT NULL
            $table->foreignId('transaction_id')
                ->nullable(false)
                ->change();
        });
    }
};