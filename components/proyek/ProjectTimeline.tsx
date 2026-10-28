'use client';

import {
  Rocket,
  Bell,
  FileQuestion,
  FileText,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import type { TimelineStage, TimelineStatus } from '@/types/proyek';

interface ProjectTimelineProps {
  stages: TimelineStage[];
}

const STAGE_ICONS: Record<string, any> = {
  go_live: Rocket,
  notifikasi: Bell,
  pir_review: FileQuestion,
  laporan: FileText,
  tindak_lanjut: ListTodo,
};

const STATUS_CONFIG: Record<
  TimelineStatus,
  {
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    nodeBg: string;
    nodeBorder: string;
    nodeText: string;
    icon: any;
  }
> = {
  selesai: {
    label: 'Selesai',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700',
    nodeBg: 'bg-emerald-500',
    nodeBorder: 'border-emerald-200 ring-4 ring-emerald-50',
    nodeText: 'text-white',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending / Berjalan',
    bgClass: 'bg-amber-50/70',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800',
    nodeBg: 'bg-amber-500',
    nodeBorder: 'border-amber-200 ring-4 ring-amber-50',
    nodeText: 'text-white',
    icon: Clock,
  },
  terlambat: {
    label: 'Terlambat',
    bgClass: 'bg-rose-50/70',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-700',
    nodeBg: 'bg-rose-500',
    nodeBorder: 'border-rose-200 ring-4 ring-rose-50',
    nodeText: 'text-white',
    icon: AlertTriangle,
  },
  belum_dimulai: {
    label: 'Belum Dimulai',
    bgClass: 'bg-gray-50/60',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-500',
    nodeBg: 'bg-gray-200',
    nodeBorder: 'border-gray-300 ring-4 ring-gray-100',
    nodeText: 'text-gray-500',
    icon: Circle,
  },
};

export function ProjectTimeline({ stages }: ProjectTimelineProps) {
  const formatTanggal = (iso?: string) => {
    if (!iso) return null;
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-800">Timeline Evaluasi PIR (5 Tahap)</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Siklus pemantauan proyek sejak rilis hingga penyelesaian tindak lanjut temuan
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span>Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
            <span>Terlambat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 ring-2 ring-gray-100" />
            <span>Belum Dimulai</span>
          </div>
        </div>
      </div>

      {/* Stepper Grid on Desktop / Vertical Stack on Mobile */}
      <div className="relative">
        {/* Desktop Horizontal Line */}
        <div className="hidden lg:block absolute top-7 left-10 right-10 h-0.75 bg-gray-100 z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const config = STATUS_CONFIG[stage.status] || STATUS_CONFIG.belum_dimulai;
            const StageIcon = STAGE_ICONS[stage.key] || Rocket;
            const StatusIcon = config.icon;

            return (
              <div
                key={stage.key}
                className="flex flex-col h-full bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-all shadow-xs hover:shadow-md p-4 group"
              >
                {/* Node icon & Step number */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105 ${config.nodeBg} ${config.nodeBorder} ${config.nodeText}`}
                  >
                    <StageIcon size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Tahap {idx + 1}
                  </span>
                </div>

                {/* Stage Title */}
                <div className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-900 transition">
                  {stage.nama}
                </div>

                {/* Date */}
                {stage.tanggal && (
                  <div className="text-[11px] font-medium text-gray-400 mb-2">
                    {formatTanggal(stage.tanggal)}
                  </div>
                )}

                {/* Description */}
                <div className="text-xs text-gray-600 flex-1 leading-relaxed mb-3">
                  {stage.deskripsi}
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bgClass} ${config.borderClass} ${config.textClass}`}
                  >
                    <StatusIcon size={12} />
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
