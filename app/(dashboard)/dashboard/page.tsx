'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, Star, Loader2 } from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { dashboardApi } from '@/lib/api/dashboard';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { StatusDonutChart } from '@/components/dashboard/statusDonutChart';
import type { Proyek, DashboardStats, StatistikPIR } from '@/types/proyek';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statistik, setStatistik] = useState<StatistikPIR | null>(null);
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [s, st, p] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.statistikPIR(),
          proyekApi.list(),
        ]);
        setStats(s);
        setStatistik(st);
        setProyekList(p);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
        Error: {error}
      </div>
    );
  }

  if (!stats || !statistik) return null;

  const cards = [
    { label: 'Total Projek', value: stats.total_proyek, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Proyek Selesai', value: stats.proyek_selesai, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'PIR Pending (>2 bulan)', value: stats.pir_pending, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'PIR Selesai', value: stats.pir_selesai, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{c.value}</div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500 flex items-start gap-4">
        <AlertTriangle className="text-red-500 shrink-0" size={24} />
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {stats.pir_pending} proyek telah go live lebih dari 2 bulan dan belum memiliki PIR.
          </div>
          <div className="text-sm text-gray-500">
            Batas wajib PIR: 2 bulan setelah tanggal go live
          </div>
        </div>
        <button className="bg-blue-900 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg">
          Lihat Notifikasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProjectTable
            data={proyekList}
            onBuatPIR={(id) => console.log('Buat PIR:', id)}
            onDetail={(id) => console.log('Detail:', id)}
          />
        </div>
        <div>
          <StatusDonutChart data={statistik} />
        </div>
      </div>
    </div>
  );
}