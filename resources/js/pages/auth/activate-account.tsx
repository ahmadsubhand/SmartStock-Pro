import { Head, useForm } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';

// Mendefinisikan tipe data untuk props
interface ActivateAccountProps {
  userId: number; // Ubah ke string jika Anda menggunakan UUID
  email: string;
  name: string;
}

export default function ActivateAccount({ email, name }: ActivateAccountProps) {
  // Tipe data form secara otomatis di-infer oleh Inertia berdasarkan nilai awal (initial state)
  const { data, setData, post, processing, errors } = useForm({
    password: '',
    password_confirmation: '',
  });

  // Menambahkan tipe FormEvent pada parameter event
  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Post ke URL saat ini (termasuk signature query params)
    post(window.location.href); 
  };

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
      <Head title="Aktivasi Akun" />

      <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Halo, {name}!</h2>
          <p className="text-sm text-gray-600 mt-2">
            Silakan buat password baru untuk mengaktifkan akun WMS Anda ({email}).
          </p>
        </div>

        <form onSubmit={submit}>
          <div>
            <label className="block font-medium text-sm text-gray-700">Password Baru</label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              required
            />
            {errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}
          </div>

          <div className="mt-4">
            <label className="block font-medium text-sm text-gray-700">Konfirmasi Password</label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end mt-6">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
            >
              {processing ? 'Memproses...' : 'Aktifkan Akun & Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}