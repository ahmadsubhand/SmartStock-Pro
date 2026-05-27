import { Head, useForm } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    email: string;
    name: string;
};

export default function ActivateAccount({ email, name }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(window.location.href); 
    };

    return (
        <>
            <Head title="Aktivasi Akun" />

            <div className="mb-6 text-sm text-gray-600 leading-relaxed">
                Halo, <span className="font-semibold text-gray-900">{name}</span>! <br/>
                Silakan buat password baru untuk mengaktifkan akun WMS Anda ({email}).
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="new-password"
                            placeholder="Masukkan password baru"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="new-password"
                            placeholder="Ulangi password baru"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={3}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Aktifkan Akun & Simpan
                    </Button>
                </div>
            </form>
        </>
    );
}

ActivateAccount.layout = {
    title: 'Aktivasi Akun Anda',
    description: 'Buat password untuk mulai menggunakan sistem WMS Enterprise.',
};