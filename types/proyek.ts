export type StatusPIR = 'selesai' | 'pending' | 'terlambat' | 'belum-jatuh-tempo';

export type TimelineStatus = 'selesai' | 'pending' | 'terlambat' | 'belum_dimulai';

export interface TimelineStage {
  key: string;
  nama: string;
  deskripsi: string;
  status: TimelineStatus;
  tanggal?: string;
}

export interface Proyek {
  id: string;
  nama_kegiatan: string;
  kategori: 'Aplikasi' | 'Infrastruktur' | 'EUC';
  unit_kerja: string;
  vendor: string;
  tanggal_go_live: string;
  status_pir: StatusPIR;
  kepuasan?: number | null;
  kesesuaian_tujuan?: number | null;
  tindak_lanjut_total?: number | null;
  tindak_lanjut_done?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProyekDetail extends Proyek {
  batas_waktu_bulan: number;
  tanggal_jatuh_tempo: string;
  timeline: TimelineStage[];
  pir_form_id?: string | null;
  pir_form_status?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  laporan_id?: string | null;
  status_laporan?: string | null;
  file_ttd_url?: string | null;
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

export interface CreateProyekPayload {
  nama_kegiatan: string;
  kategori: string;
  unit_kerja: string;
  vendor?: string;
  tanggal_go_live: string;
  status_pir?: string;
}