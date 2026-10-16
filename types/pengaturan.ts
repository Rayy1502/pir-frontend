export interface PengaturanUnitKerja {
  id: string;
  unit_kerja: string;
  batas_waktu_bulan: number;
  aktif: boolean;
  updated_at: string;
}

export interface UpdatePengaturanPayload {
  batas_waktu_bulan: number;
}
