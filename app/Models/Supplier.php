<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'contact_person', 'email', 'phone', 'address'])]
class Supplier extends Model
{
    use Auditable;

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}