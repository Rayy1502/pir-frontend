import type { Proyek, DashboardStats, StatistikPIR } from '@/types/proyek';

export const MOCK_STATS: DashboardStats = {
  totalProyek: 24,
  proyekSelesai: 15,
  pirPending: 5,
  pirSelesai: 11,
};

export const MOCK_STATISTIK: StatistikPIR = {
  selesai: 11,
  pending: 5,
  terlambat: 3,
  belumJatuhTempo: 5,
  total: 24,
};

export const MOCK_PROYEK: Proyek[] = [
  {
    id: 'p1',
    namaKegiatan: 'Sistem e-Procurement v2',
    kategori: 'Aplikasi',
    unitKerja: 'Infrastruktur',
    vendor: 'Tim Internal Aplikasi',
    tanggalGoLive: '2026-05-12',
    statusPIR: 'terlambat',
  },
  {
    id: 'p2',
    namaKegiatan: 'Upgrade Jaringan WAN Pabrik',
    kategori: 'Infrastruktur',
    unitKerja: 'Infrastruktur',
    vendor: 'PT Sigma Cipta Caraka',
    tanggalGoLive: '2026-05-18',
    statusPIR: 'terlambat',
  },
  {
    id: 'p3',
    namaKegiatan: 'Migrasi Server Virtualisasi',
    kategori: 'Infrastruktur',
    unitKerja: 'Infrastruktur',
    vendor: 'Tim Internal Infrastruktur',
    tanggalGoLive: '2026-07-15',
    statusPIR: 'pending',
  },
  {
    id: 'p4',
    namaKegiatan: 'Portal HSE Mobile',
    kategori: 'Aplikasi',
    unitKerja: 'Digitalisasi',
    vendor: 'PT Digital Nusantara',
    tanggalGoLive: '2026-04-10',
    statusPIR: 'selesai',
    kepuasan: 4.2,
    kesesuaianTujuan: 85,
    tindakLanjutSelesai: 1,
    tindakLanjutTotal: 3,
  },
  {
    id: 'p5',
    namaKegiatan: 'Aplikasi Monitoring Produksi',
    kategori: 'Aplikasi',
    unitKerja: 'Digitalisasi',
    vendor: 'Tim Internal Aplikasi',
    tanggalGoLive: '2026-03-03',
    statusPIR: 'selesai',
    kepuasan: 4.5,
    kesesuaianTujuan: 90,
    tindakLanjutSelesai: 3,
    tindakLanjutTotal: 3,
  },
  {
    id: 'p6',
    namaKegiatan: 'Pengadaan Laptop & Thin Client',
    kategori: 'EUC',
    unitKerja: 'Layanan',
    vendor: 'PT Lenovo Indonesia',
    tanggalGoLive: '2026-08-28',
    statusPIR: 'belum-jatuh-tempo',
  },
];