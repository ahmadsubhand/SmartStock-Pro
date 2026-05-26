<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

trait Auditable
{
    /**
     * Boot the trait secara otomatis saat model dipanggil oleh Laravel.
     */
    public static function bootAuditable()
    {
        // 1. Saat data baru dibuat
        static::created(function (Model $model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        // 2. Saat data diperbarui
        static::updated(function (Model $model) {
            // Ambil hanya kolom yang berubah
            $newValues = $model->getChanges();
            
            // Ambil nilai lama hanya untuk kolom yang berubah
            $oldValues = array_intersect_key($model->getOriginal(), $newValues);

            // Opsional: Hapus kolom 'updated_at' agar log lebih bersih (karena selalu berubah)
            unset($newValues['updated_at']);
            unset($oldValues['updated_at']);

            // Catat log hanya jika ada perubahan riil selain updated_at
            if (count($newValues) > 0) {
                $model->logAudit('updated', $oldValues, $newValues);
            }
        });

        // 3. Saat data dihapus
        static::deleted(function (Model $model) {
            $model->logAudit('deleted', $model->getOriginal(), null);
        });
    }

    /**
     * Fungsi helper untuk menyimpan data ke tabel audit_logs.
     */
    protected function logAudit(string $event, ?array $oldValues = null, ?array $newValues = null)
    {
        AuditLog::create([
            'user_id' => auth()->id(), // Akan null jika dijalankan via CLI/Seeder
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(), // Ambil IP Address
        ]);
    }
}