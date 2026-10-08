export type StatusPIR = 'selesai' | 'pending' | 'terlambat' | 'belum-jatuh-tempo';

export interface Proyek {
  id: string;
  namaKegiatan: string;
  kategori: 'Aplikasi' | 'Infrastruktur' | 'EUC';
  unitKerja: string;
  vendor: string;
  tanggalGoLive: string;
  statusPIR: StatusPIR;
  kepuasan?: number;
  kesesuaianTujuan?: number;
  tindakLanjutSelesai?: number;
  tindakLanjutTotal?: number;
}

export interface DashboardStats {
  totalProyek: number;
  proyekSelesai: number;
  pirPending: number;
  pirSelesai: number;
}

export interface StatistikPIR {
  selesai: number;
  pending: number;
  terlambat: number;
  belumJatuhTempo: number;
  total: number;
}