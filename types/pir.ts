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
  status: 'draft' | 'submitted' | 'in_progress' | 'selesai';
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
