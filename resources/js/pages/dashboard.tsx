import 'leaflet/dist/leaflet.css';
import { Head } from '@inertiajs/react';
import L from 'leaflet';
// [PENTING]: Memperbaiki bug icon marker Leaflet yang hilang di React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Package, Map as MapIcon, DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

// --- Interfaces ---
interface DashboardProps {
  metrics: {
    valuation: number;
    total_products: number;
    total_warehouses: number;
    total_stock: number;
  };
  chart_data: Array<{ date: string; inbound_count: string; outbound_count: string }>;
  warehouses_map: Array<{ id: number; name: string; location: string; lat: string; lng: string }>;
  recent_activities: Array<{ id: number; reference: string; type: string; warehouse: string; user: string; date: string }>;
}

export default function Dashboard({ metrics, chart_data, warehouses_map, recent_activities }: DashboardProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Format ulang data grafik agar ramah dibaca Recharts (Sesuaikan dengan in_count dan out_count)
  const formattedChartData = chart_data.map((d: any) => ({
    name: formatDate(d.date),
    Masuk: Number(d.in_count),
    Keluar: Number(d.out_count)
  }));

  // Koordinat pusat peta (Titik Tengah Indonesia / Laut Jawa)
  const mapCenter: [number, number] = [-2.5489, 118.0149];

  return (
    <div className="p-8 pb-20">
      <Head title="Executive Dashboard" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Executive Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan valuasi, metrik operasional, dan pemetaan gudang.</p>
      </div>

      {/* 1. METRIK TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Total Valuasi Aset</h3>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><DollarSign className="h-5 w-5" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatRupiah(metrics.valuation)}</p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center"><TrendingUp className="h-3 w-3 mr-1"/> Berdasarkan kalkulasi HPP FIFO</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Total Kuantitas Stok</h3>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Package className="h-5 w-5" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{metrics.total_stock.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">Unit</span></p>
          <p className="text-xs text-gray-400 mt-2">Tersebar di seluruh cabang</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Jenis Produk Aktif</h3>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Package className="h-5 w-5" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{metrics.total_products}</p>
          <p className="text-xs text-gray-400 mt-2">SKU terdaftar di Master Data</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-500 text-sm">Jaringan Gudang</h3>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><MapIcon className="h-5 w-5" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{metrics.total_warehouses}</p>
          <p className="text-xs text-gray-400 mt-2">Pusat distribusi aktif</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 2. GRAFIK TREN (Kiri - Memakan 2 Kolom) */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-6">Tren Mutasi Stok (7 Hari Terakhir)</h2>
          <div className="flex-1 min-h-75">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="Masuk" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" />
                <Area type="monotone" dataKey="Keluar" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorKeluar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. PETA GUDANG INTERAKTIF (Kanan - 1 Kolom) */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-blue-500" /> Pemetaan Jaringan Gudang
          </h2>
          <div className="flex-1 w-full rounded-lg overflow-hidden border min-h-75 z-0 relative">
            <MapContainer 
              center={mapCenter} 
              zoom={4} 
              scrollWheelZoom={false} 
              className="h-full w-full absolute inset-0"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {warehouses_map.map((wh) => (
                <Marker key={wh.id} position={[Number(wh.lat), Number(wh.lng)]}>
                  <Popup>
                    <div className="font-semibold text-sm">{wh.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{wh.location}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

      </div>

      {/* 4. TABEL AKTIVITAS TERKINI */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Riwayat Mutasi Terkini</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b text-gray-500">
              <tr>
                <th className="p-4 font-medium">No. Referensi</th>
                <th className="p-4 font-medium">Jenis Transaksi</th>
                <th className="p-4 font-medium">Gudang</th>
                <th className="p-4 font-medium">Operator</th>
                <th className="p-4 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recent_activities.length > 0 ? recent_activities.map((act) => (
                <tr key={act.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-blue-600">{act.reference}</td>
                  <td className="p-4">
                    {act.type === 'inbound' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3" /> Masuk
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 inline-flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> Keluar
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{act.warehouse}</td>
                  <td className="p-4 text-gray-600">{act.user}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(act.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada aktivitas transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}