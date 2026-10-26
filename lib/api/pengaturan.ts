import { api } from './client';
import { PengaturanUnitKerja, UpdatePengaturanPayload } from '@/types/pengaturan';

export const pengaturanApi = {
  getAll: async (): Promise<PengaturanUnitKerja[]> => {
    const data = await api.get<PengaturanUnitKerja[]>('/pengaturan');
    return data || [];
  },
  update: (unit: string, payload: UpdatePengaturanPayload) =>
    api.put<{ message: string }>(`/pengaturan/${encodeURIComponent(unit)}`, payload),
};
