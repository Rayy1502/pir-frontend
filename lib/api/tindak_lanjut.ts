import { api } from './client';
import {
  TindakLanjut,
  TindakLanjutBukti,
  CreateTindakLanjutPayload,
  UpdateTindakLanjutPayload,
} from '@/types/pir';

export const tindakLanjutApi = {
  list: async (params?: { status?: string; laporan_id?: string; q?: string }): Promise<TindakLanjut[]> => {
    const qParams = new URLSearchParams();
    if (params?.status) qParams.append('status', params.status);
    if (params?.laporan_id) qParams.append('laporan_id', params.laporan_id);
    if (params?.q) qParams.append('q', params.q);
    const qs = qParams.toString();
    const data = await api.get<TindakLanjut[]>(`/tindak-lanjut${qs ? `?${qs}` : ''}`);
    return data || [];
  },
  getByID: (id: string) => api.get<TindakLanjut>(`/tindak-lanjut/${id}`),
  create: (payload: CreateTindakLanjutPayload) =>
    api.post<TindakLanjut>('/tindak-lanjut', payload),
  update: (id: string, payload: UpdateTindakLanjutPayload) =>
    api.put<TindakLanjut>(`/tindak-lanjut/${id}`, payload),
  uploadBukti: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<TindakLanjutBukti>(`/tindak-lanjut/${id}/bukti`, formData);
  },
};
