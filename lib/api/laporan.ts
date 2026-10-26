import { api, downloadPdf } from './client';
import { LaporanPIR, CreateLaporanPayload } from '@/types/pir';

export const laporanApi = {
  create: (payload: CreateLaporanPayload) =>
    api.post<LaporanPIR>('/laporan', payload),
  list: async (params?: { proyek_id?: string; q?: string }): Promise<LaporanPIR[]> => {
    const qParams = new URLSearchParams();
    if (params?.proyek_id) qParams.append('proyek_id', params.proyek_id);
    if (params?.q) qParams.append('q', params.q);
    const qs = qParams.toString();
    const data = await api.get<LaporanPIR[]>(`/laporan${qs ? `?${qs}` : ''}`);
    return data || [];
  },
  getByID: (id: string) => api.get<LaporanPIR>(`/laporan/${id}`),
  getByProyekID: (proyekId: string) =>
    api.get<LaporanPIR | null>(`/laporan/proyek/${proyekId}`),
  downloadPdf: (id: string, filename: string) =>
    downloadPdf(`/laporan/${id}/pdf`, filename),
  uploadSignedPdf: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<LaporanPIR>(`/laporan/${id}/upload-ttd`, formData);
  },
};
