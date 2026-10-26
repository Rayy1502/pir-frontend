import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { proyekApi } from '@/lib/api/proyek';

interface NotificationStore {
  unreadCount: number;
  readIds: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: (ids: string[]) => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      unreadCount: 0,
      readIds: [],

      markAsRead: (id: string) => {
        const { readIds, unreadCount } = get();
        if (!readIds.includes(id)) {
          set({
            readIds: [...readIds, id],
            unreadCount: Math.max(0, unreadCount - 1),
          });
        }
      },

      markAllAsRead: (ids: string[]) => {
        const currentRead = get().readIds;
        set({
          readIds: Array.from(new Set([...currentRead, ...ids])),
          unreadCount: 0,
        });
      },

      fetchUnreadCount: async () => {
        try {
          const list = (await proyekApi.list()) || [];
          // Notifikasi aktif: proyek yang berstatus terlambat atau pending
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
