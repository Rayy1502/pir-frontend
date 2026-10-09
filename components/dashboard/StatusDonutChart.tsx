'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { StatistikPIR } from '@/types/proyek';

interface Props {
  data: StatistikPIR;
}

const COLORS = {
  selesai: '#10b981',
  pending: '#facc15',
  terlambat: '#ef4444',
  belumJatuhTempo: '#cbd5e1',
};

export function StatusDonutChart({ data }: Props) {
  const chartData = [
    { name: 'Selesai', value: data.selesai, key: 'selesai' },
    { name: 'Pending', value: data.pending, key: 'pending' },
    { name: 'Terlambat', value: data.terlambat, key: 'terlambat' },
    {
      name: 'Belum jatuh tempo',
      value: data.belumJatuhTempo,
      key: 'belumJatuhTempo',
    },
  ];

  const legend = [
    { label: `Selesai (${data.selesai})`, color: COLORS.selesai },
    { label: `Pending (${data.pending})`, color: COLORS.pending },
    { label: `Terlambat (${data.terlambat})`, color: COLORS.terlambat },
    {
      label: `Belum jatuh tempo (${data.belumJatuhTempo})`,
      color: COLORS.belumJatuhTempo,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Statistik Status PIR</h2>

      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={COLORS[entry.key as keyof typeof COLORS]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-800">{data.total}</div>
          <div className="text-xs text-gray-500">proyek</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-gray-700">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}