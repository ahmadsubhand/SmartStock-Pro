<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $report_name }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
        .header p { margin: 5px 0 0 0; color: #555; }
        .table-data { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table-data th, .table-data td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table-data th { background-color: #f4f4f4; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 30px; font-size: 10px; color: #777; text-align: right; }
    </style>
</head>
<body>

    <div class="header">
        <h1>{{ $report_name }}</h1>
        <p>Sistem Manajemen Inventaris - WMS Enterprise</p>
        <p>Dicetak pada: {{ $generated_at }} | Oleh: {{ $generated_by }}</p>
    </div>

    <table class="table-data">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="15%">SKU</th>
                <th width="35%">Nama Produk</th>
                <th width="25%">Lokasi Gudang</th>
                <th width="20%" class="text-right">Total Kuantitas</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $row)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $row->product->sku }}</td>
                    <td>{{ $row->product->name }}</td>
                    <td>{{ $row->warehouse->name }}</td>
                    <td class="text-right">{{ number_format($row->total_qty, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data stok yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        *Dokumen ini digenerate secara otomatis oleh sistem.
    </div>

</body>
</html>