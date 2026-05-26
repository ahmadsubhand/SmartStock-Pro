<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class UserActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aktivasi Akun Warehouse Management System',
        );
    }

    public function content(): Content
    {
        // Membuat URL unik yang aman dan kedaluwarsa dalam 48 jam
        $activationUrl = URL::temporarySignedRoute(
            'account.activate.show',
            now()->addHours(48),
            ['user' => $this->user->id]
        );

        return new Content(
            view: 'emails.users.activation', // Anda perlu membuat file blade simple untuk email ini
            with: ['activationUrl' => $activationUrl],
        );
    }
}