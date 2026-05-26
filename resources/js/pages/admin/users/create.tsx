import { Head, useForm, Link } from '@inertiajs/react';
import type{ SyntheticEvent } from 'react';

interface Role {
  id: number;
  name: string;
}

interface CreateUserProps {
  roles: Role[];
}

export default function CreateUser({ roles }: CreateUserProps) {
  const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
    name: '',
    email: '',
    role_id: '', 
  });

  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/admin/users', {
      onSuccess: () => reset('name', 'email', 'role_id'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Head title="Buat User Baru" />

      <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Tambah User Baru</h2>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
        </div>

        {recentlySuccessful && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            Akun berhasil dibuat. Email aktivasi telah dikirim ke {data.email}!
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
            />
            {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
            <input
              type="email"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              required
            />
            {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Peran</label>
            <select
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
              value={data.role_id}
              onChange={(e) => setData('role_id', e.target.value)}
              required
            >
              <option value="" disabled>Pilih role untuk user ini</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {/* Uppercase huruf pertama untuk estetika */}
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </option>
              ))}
            </select>
            {errors.role_id && <span className="text-red-500 text-sm mt-1 block">{errors.role_id}</span>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {processing ? 'Memproses...' : 'Buat Akun & Kirim Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}