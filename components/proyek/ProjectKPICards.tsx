'use client';

import { Star, Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface ProjectKPICardsProps {
  kepuasan?: number | null;
  kesesuaianTujuan?: number | null;
  tindakLanjutDone?: number | null;
  tindakLanjutTotal?: number | null;
  statusPIR: string;
}

export function ProjectKPICards({
  kepuasan,
  kesesuaianTujuan,
  tindakLanjutDone,
  tindakLanjutTotal,
  statusPIR,
}: ProjectKPICardsProps) {
  // 1. Kepuasan (Skala 1 - 5)
  const renderKepuasan = () => {
    if (kepuasan != null && kepuasan > 0) {
      const score = Number(kepuasan.toFixed(1));
      let badgeText = 'Memuaskan';
      let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (score >= 4.5) {
        badgeText = 'Sangat Memuaskan';
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (score < 3.5) {
        badgeText = 'Perlu Peningkatan';
        badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      }

      const percent = Math.min(100, Math.round((score / 5) * 100));

      return (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tingkat Kepuasan
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-gray-800">{score}</span>
            <span className="text-sm font-medium text-gray-400">/ 5.0</span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-linear-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tingkat Kepuasan
          </span>
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center">
            <Star size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400 mb-2">-</div>
        <div className="text-xs text-gray-500 mb-3">
          {statusPIR === 'selesai' ? 'Data survei belum tersedia' : 'Menunggu tahap survey PIR'}
        </div>
        <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Belum Dievaluasi
        </span>
      </div>
    );
  };

  // 2. Kesesuaian Tujuan (Persentase 0 - 100%)
  const renderKesesuaian = () => {
    if (kesesuaianTujuan != null && kesesuaianTujuan > 0) {
      const percent = kesesuaianTujuan;
      let badgeText = 'Sesuai Target';
      let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      if (percent >= 90) {
        badgeText = 'Sangat Sesuai (≥90%)';
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (percent < 70) {
        badgeText = 'Kurang Sesuai (<70%)';
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      }

      return (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Kesesuaian Tujuan
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-gray-800">{percent}%</span>
            <span className="text-xs font-medium text-gray-400">terhadap rencana awal</span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-linear-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Kesesuaian Tujuan
          </span>
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center">
            <Target size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400 mb-2">-</div>
        <div className="text-xs text-gray-500 mb-3">
          {statusPIR === 'selesai' ? 'Data capaian belum dicatat' : 'Menunggu tahap laporan evaluasi'}
        </div>
        <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Belum Dihitung
        </span>
      </div>
    );
  };

  // 3. Progress Tindak Lanjut
  const renderTindakLanjut = () => {
    const total = tindakLanjutTotal || 0;
    const done = tindakLanjutDone || 0;

    if (total > 0 || statusPIR === 'selesai') {
      const calcDone = total > 0 ? done : 1;
      const calcTotal = total > 0 ? total : 1;
      const percent = Math.round((calcDone / calcTotal) * 100);

      const isCompleted = percent === 100;

      return (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Progress Tindak Lanjut
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-gray-800">{percent}%</span>
            <span className="text-xs font-medium text-gray-500">
              ({calcDone} dari {calcTotal} temuan selesai)
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-linear-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <span
            className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isCompleted ? 'Selesai 100%' : 'Sedang Ditindaklanjuti'}
          </span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Progress Tindak Lanjut
          </span>
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-400 mb-2">-</div>
        <div className="text-xs text-gray-500 mb-3">
          Belum ada temuan rekomendasi yang tercatat
        </div>
        <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          Belum Ada Temuan
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderKepuasan()}
      {renderKesesuaian()}
      {renderTindakLanjut()}
    </div>
  );
}
