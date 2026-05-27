import { Head, Link, usePage } from '@inertiajs/react';
import { Package, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
  const { auth } = usePage().props as any;

  return (
    <>
      <Head title="Welcome to SmartStock Pro" />
      <div className="flex min-h-screen flex-col items-center bg-gray-50 p-6 text-gray-900 lg:justify-center lg:p-8 dark:bg-gray-950 dark:text-gray-100">
        
        {/* HEADER NAVIGATION */}
        <header className="mb-6 w-full max-w-83.75 text-sm lg:max-w-4xl">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400">
              <Package className="h-6 w-6" />
              <span>SmartStock Pro</span>
            </div>
            <div className="flex items-center gap-4">
              {auth.user ? (
                <Link
                  href={dashboard()}
                  className="inline-block rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Masuk ke Dashboard
                </Link>
              ) : (
                <Link
                  href={login()}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
                >
                  Log in <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </div>
          </nav>
        </header>

        {/* MAIN HERO SECTION */}
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow">
          <main className="flex w-full max-w-83.75 flex-col-reverse lg:max-w-4xl lg:flex-row shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            
            {/* LEFT COLUMN: TEXT & FEATURES */}
            <div className="flex-1 bg-white p-8 pb-12 lg:p-16 dark:bg-gray-900">
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 mb-6">
                WMS Enterprise v1.0
              </div>
              
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
                Manajemen Gudang<br /> Tanpa Kompromi.
              </h1>
              
              <p className="mb-8 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Platform Enterprise untuk memantau pergerakan stok, transfer antar cabang, dan valuasi aset secara real-time. Dirancang untuk efisiensi dan akurasi tinggi.
              </p>
              
              <ul className="mb-8 flex flex-col gap-5">
                <li className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Visibilitas Real-time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pantau metrik valuasi HPP FIFO dan tren mutasi dari dashboard eksekutif.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Transfer Multi-Gudang</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola perpindahan stok antar cabang dengan sistem tracking in-transit yang aman.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Keamanan RBAC</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Akses sistem dilindungi dengan kontrol peran berjenjang untuk mencegah manipulasi data.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* RIGHT COLUMN: ABSTRACT GRAPHIC */}
            <div className="relative flex aspect-4/3 w-full shrink-0 flex-col items-center justify-center bg-indigo-50 lg:aspect-auto lg:w-105 dark:bg-gray-950 border-l border-gray-100 dark:border-gray-800 overflow-hidden">
              
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
              
              <div className="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
                <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <Package className="h-20 w-20 text-indigo-600 dark:text-indigo-400" strokeWidth={1} />
              </div>

              {/* Mock Dashboard Element */}
              <div className="absolute bottom-8 right-8 left-8 rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm ring-1 ring-gray-900/5 dark:bg-gray-900/80 dark:ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sistem Berjalan Normal</span>
                  </div>
                  <span className="text-xs text-gray-500">v1.0.0</span>
                </div>
              </div>
            </div>

          </main>
        </div>
        
        <div className="hidden h-14 lg:block"></div>
      </div>
    </>
  );
}