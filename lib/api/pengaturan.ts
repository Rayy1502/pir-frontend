import { api } from './client';
import { PengaturanUnitKerja, UpdatePengaturanPayload } from '@/types/pengaturan';

export const pengaturanApi = {
  getAll: () => api.get<PengaturanUnitKerja[]>('/pengaturan'),
  update: (unit: string, payload: UpdatePengaturanPayload) =>
    api.put<{ message: string }>(`/pengaturan/${encodeURIComponent(unit)}`, payload),
};
