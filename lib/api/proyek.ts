import { api } from './client';
import type { Proyek, ProyekDetail } from '@/types/proyek';

export interface ProyekFilter {
  q?: string;
  kategori?: string;
  status?: string;
}

export const proyekApi = {
  list: (filter?: ProyekFilter) => {
    const params = new URLSearchParams();
    if (filter?.q) params.append('q', filter.q);
    if (filter?.kategori) params.append('kategori', filter.kategori);
    if (filter?.status) params.append('status', filter.status);
    const qs = params.toString();
    return api.get<Proyek[]>(`/proyek${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) => api.get<ProyekDetail>(`/proyek/${id}`),
};