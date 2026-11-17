import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notifikasiApi } from '@/lib/api/notifikasi';
import { proyekApi } from '@/lib/api/proyek';

interface NotificationStore {
  unreadCount: number;
  readIds: string[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (ids?: string[]) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      unreadCount: 0,
      readIds: [],

      markAsRead: async (id: string) => {
        const { readIds, unreadCount } = get();
        if (!readIds.includes(id)) {
          set({
            readIds: [...readIds, id],
            unreadCount: Math.max(0, unreadCount - 1),
          });
        }
        try {
          // Jika ID bertipe UUID (dari database notifikasi)
          if (!id.includes('telat-') && !id.includes('segera-')) {
            await notifikasiApi.markAsRead(id);
          }
        } catch (e) {
          console.error('Error sync markAsRead ke backend:', e);
        }
      },

      markAllAsRead: async (ids?: string[]) => {
        const currentRead = get().readIds;
        const newReadIds = ids ? Array.from(new Set([...currentRead, ...ids])) : currentRead;
        set({
          readIds: newReadIds,
          unreadCount: 0,
        });
        try {
          await notifikasiApi.markAllAsRead();
        } catch (e) {
          console.error('Error sync markAllAsRead ke backend:', e);
        }
      },

      fetchUnreadCount: async () => {
        try {
          // 1. Ambil jumlah unread dari API Notifikasi (Milestone M9)
          const apiUnread = await notifikasiApi.getUnreadCount();
          if (apiUnread > 0) {
            set({ unreadCount: apiUnread });
            return;
          }

          // 2. Fallback: sinkronisasi lokal dengan status proyek
          const list = (await proyekApi.list()) || [];
          const activeIds = list
            .filter((p) => p.status_pir === 'terlambat' || p.status_pir === 'pending')
            .map((p) => p.id);

          const readIds = get().readIds || [];
          const unread = activeIds.filter((id) => !readIds.includes(id)).length;
          set({ unreadCount: unread });
        } catch (err) {
          console.error('Gagal mengambil data jumlah notifikasi:', err);
        }
      },
    }),
    {
      name: 'pusri-pir-notifications',
    }
  )
);
