export type StatusPIR = 'selesai' | 'pending' | 'terlambat' | 'belum-jatuh-tempo';

export interface Proyek {
  id: string;
  nama_kegiatan: string;
  kategori: 'Aplikasi' | 'Infrastruktur' | 'EUC';
  unit_kerja: string;
  vendor: string;
  tanggal_go_live: string;
  status_pir: StatusPIR;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_proyek: number;
  proyek_selesai: number;
  pir_pending: number;
  pir_selesai: number;
}

export interface StatistikPIR {
  selesai: number;
  pending: number;
  terlambat: number;
  belum_jatuh_tempo: number;
  total: number;
}