<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('export_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Siapa yang minta laporan
            $table->string('report_name'); // Contoh: "Laporan Stok Gudang Jakarta"
            $table->string('type'); // Contoh: 'inventory', 'transaction'
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->string('file_path')->nullable(); // Lokasi file PDF setelah selesai dibuat
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_documents');
    }
};