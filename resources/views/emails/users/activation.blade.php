<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Aktivasi Akun WMS</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; max-w-md; margin: 0 auto; padding: 20px;">
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1f2937; margin-top: 0;">Halo!</h2>
        
        <p>Sebuah akun telah dibuat untuk Anda di Warehouse Management System (WMS). Untuk mulai menggunakan sistem, Anda perlu mengaktifkan akun dan membuat password baru.</p>
        
        <p>Silakan klik tombol di bawah ini untuk melanjutkan proses aktivasi:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $activationUrl }}" style="background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aktifkan Akun Saya
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
            <em>Catatan: Tautan aktivasi ini bersifat rahasia dan hanya berlaku selama 48 jam.</em>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            Jika Anda kesulitan mengklik tombol di atas, silakan *copy* dan *paste* URL berikut ke browser Anda:<br>
            <a href="{{ $activationUrl }}" style="color: #3b82f6; word-break: break-all;">{{ $activationUrl }}</a>
        </p>
    </div>

</body>
</html>