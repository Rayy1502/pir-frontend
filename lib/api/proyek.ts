import { api } from './client';
import type { Proyek, ProyekDetail, CreateProyekPayload } from '@/types/proyek';

export interface ProyekFilter {
  q?: string;
  kategori?: string;
  status?: string;
}

export const proyekApi = {
  list: async (filter?: ProyekFilter): Promise<Proyek[]> => {
    const params = new URLSearchParams();
    if (filter?.q) params.append('q', filter.q);
    if (filter?.kategori) params.append('kategori', filter.kategori);
    if (filter?.status) params.append('status', filter.status);
    const qs = params.toString();
    const data = await api.get<Proyek[]>(`/proyek${qs ? `?${qs}` : ''}`);
    return data || [];
  },
  detail: (id: string) => api.get<ProyekDetail>(`/proyek/${id}`),
  create: (payload: CreateProyekPayload) => api.post<Proyek>('/proyek', payload),
};