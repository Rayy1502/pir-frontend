import { api } from './client';
import type { DashboardStats, StatistikPIR } from '@/types/proyek';

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  statistikPIR: () => api.get<StatistikPIR>('/dashboard/statistik-pir'),
};