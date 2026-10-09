import type { StatusPIR } from '@/types/proyek';

const CONFIG: Record<StatusPIR, { label: string; className: string }> = {
  selesai: {
    label: 'Selesai',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  terlambat: {
    label: 'Terlambat',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  'belum-jatuh-tempo': {
    label: 'Belum jatuh tempo',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function StatusBadge({ status }: { status: StatusPIR }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${c.className}`}
    >
      {c.label}
    </span>
  );
}