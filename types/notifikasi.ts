export type TipeNotifikasi = 'waktu_pir' | 'segera' | 'terlambat';

export interface Notifikasi {
  id: string;
  proyek_id: string;
  tipe: TipeNotifikasi;
  judul: string;
  deskripsi: string;
  dibaca: boolean;
  created_at: string;
  nama_kegiatan?: string;
  unit_kerja?: string;
  tanggal_rilis?: string;
}

export interface NotifikasiFilter {
  dibaca?: boolean;
}
