import { Proyek } from './proyek';

export type MetodePIR = 'observasi' | 'wawancara' | 'survey';

export interface PIRForm {
  id: string;
  proyek_id: string;
  tujuan_awal: string;
  metode: MetodePIR;
  catatan_kondisi?: string;
  nama_narasumber?: string;
  jabatan_narasumber?: string;
  daftar_pertanyaan?: string;
  kesimpulan_wawancara?: string;
  responden?: string;
  status: 'draft' | 'submitted' | 'approved' | 'in_progress' | 'menunggu_ttd' | 'laporan_selesai' | 'selesai';
  approved_by?: string | null;
  approved_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
  proyek?: Proyek;
}

export interface CreatePIRPayload {
  proyek_id: string;
  vendor: string;
  tujuan_awal: string;
  metode: MetodePIR;
  catatan_kondisi?: string;
  nama_narasumber?: string;
  jabatan_narasumber?: string;
  daftar_pertanyaan?: string;
  kesimpulan_wawancara?: string;
  responden?: string;
  status: 'draft' | 'submitted';
}

export interface UpdatePIRPayload {
  vendor: string;
  tujuan_awal: string;
  metode: MetodePIR;
  catatan_kondisi?: string;
  nama_narasumber?: string;
  jabatan_narasumber?: string;
  daftar_pertanyaan?: string;
  kesimpulan_wawancara?: string;
  responden?: string;
  status: 'draft' | 'submitted';
}

// ==========================================
// M6: Survey Types
// ==========================================
export interface SurveyJawaban {
  id: string;
  pertanyaan_id: string;
  jawaban_teks?: string;
  jawaban_angka?: number;
  created_at: string;
}

export interface SurveyPertanyaan {
  id: string;
  pir_form_id: string;
  pertanyaan: string;
  tipe: 'skala' | 'teks' | 'pilihan';
  urutan: number;
  created_at: string;
  jawaban?: SurveyJawaban;
}

export interface CustomPertanyaanInput {
  pertanyaan: string;
  tipe: 'skala' | 'teks' | 'pilihan';
  urutan?: number;
  jawaban_teks?: string;
  jawaban_angka?: number;
}

export interface SubmitSurveyPayload {
  kepuasan: number;
  kesesuaian_tujuan: number;
  kendala: string;
  saran: string;
  custom_pertanyaan?: CustomPertanyaanInput[];
}

export interface SurveyResponse {
  pir_form_id: string;
  kepuasan: number;
  kesesuaian_tujuan: number;
  kendala: string;
  saran: string;
  pertanyaan: SurveyPertanyaan[];
}

// ==========================================
// M7: Laporan PIR Types
// ==========================================
export interface LaporanTemuan {
  id: string;
  laporan_id: string;
  temuan: string;
  urutan: number;
}

export interface LaporanPIR {
  id: string;
  nomor_pir: string;
  proyek_id: string;
  pir_form_id: string;
  ringkasan: string;
  kepuasan: number;
  kesesuaian_tujuan: number;
  rekomendasi: string;
  tanggal_laporan: string;
  pembuat_id?: string;
  pembuat_nama?: string;
  file_ttd_url?: string | null;
  file_ttd_nama?: string | null;
  status_laporan?: string | null;
  signed_at?: string | null;
  created_at: string;
  proyek?: Proyek;
  pir_form?: PIRForm;
  temuan?: LaporanTemuan[];
}

export interface CreateLaporanPayload {
  proyek_id: string;
  pir_form_id: string;
  ringkasan: string;
  kepuasan: number;
  kesesuaian_tujuan: number;
  rekomendasi: string;
  tanggal_laporan: string;
  temuan: string[];
}

// ==========================================
// M8: Tindak Lanjut Types
// ==========================================
export interface TindakLanjutBukti {
  id: string;
  tindak_lanjut_id: string;
  nama_file: string;
  url: string;
  ukuran_bytes: number;
  uploaded_at: string;
}

export interface TindakLanjut {
  id: string;
  laporan_id: string;
  nomor_pir?: string;
  proyek_id?: string;
  nama_kegiatan?: string;
  unit_kerja?: string;
  temuan: string;
  pic: string;
  target_selesai: string;
  status: 'open' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
  bukti?: TindakLanjutBukti[];
}

export interface CreateTindakLanjutPayload {
  laporan_id: string;
  temuan: string;
  pic: string;
  target_selesai: string;
  status?: 'open' | 'in_progress' | 'done';
}

export interface UpdateTindakLanjutPayload {
  temuan: string;
  pic: string;
  target_selesai: string;
  status: 'open' | 'in_progress' | 'done';
}
