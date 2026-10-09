'use client';

import { Users, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { MOCK_STATS, MOCK_STATISTIK, MOCK_PROYEK } from '@/lib/mock-data';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { StatusDonutChart } from '@/components/dashboard/StatusDonutChart';

export default function DashboardPage() {
  const stats = MOCK_STATS;

  const cards = [
    {
      label: 'Total Projek',
      value: stats.totalProyek,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Proyek Selesai',
      value: stats.proyekSelesai,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'PIR Pending (>2 bulan)',
      value: stats.pirPending,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'PIR Selesai',
      value: stats.pirSelesai,
      icon: Star,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.color}`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {c.value}
                  </div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert */}
      <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500 flex items-start gap-4">
        <AlertTriangle className="text-red-500 shrink-0" size={24} />
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {stats.pirPending} proyek telah go live lebih dari 2 bulan dan belum
            memiliki PIR.
          </div>
          <div className="text-sm text-gray-500">
            Batas wajib PIR: 2 bulan setelah tanggal go live
          </div>
        </div>
        <button className="bg-blue-900 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg">
          Lihat Notifikasi
        </button>
      </div>

      {/* Tabel + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProjectTable
            data={MOCK_PROYEK}
            onBuatPIR={(id) => console.log('Buat PIR:', id)}
            onDetail={(id) => console.log('Detail:', id)}
          />
        </div>
        <div>
          <StatusDonutChart data={MOCK_STATISTIK} />
        </div>
      </div>
    </div>
  );
}