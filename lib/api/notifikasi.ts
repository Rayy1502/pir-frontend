import { apiFetch } from './client';
import { Notifikasi, NotifikasiFilter } from '@/types/notifikasi';

export const notifikasiApi = {
  list: async (filter?: NotifikasiFilter): Promise<Notifikasi[]> => {
    let endpoint = '/v1/notifikasi';
    if (filter && filter.dibaca !== undefined) {
      endpoint += `?dibaca=${filter.dibaca}`;
    }
    const res = await apiFetch<Notifikasi[]>(endpoint);
    return res || [];
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiFetch<{ unread_count: number }>('/v1/notifikasi/unread-count');
      return res?.unread_count ?? 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiFetch(`/v1/notifikasi/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async (): Promise<void> => {
    await apiFetch('/v1/notifikasi/read-all', { method: 'PUT' });
  },

  triggerEvaluation: async (): Promise<void> => {
    await apiFetch('/v1/notifikasi/trigger', { method: 'POST' });
  },
};
