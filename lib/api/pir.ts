import { api } from './client';
import { PIRForm, CreatePIRPayload, UpdatePIRPayload } from '@/types/pir';

export const pirApi = {
  create: (payload: CreatePIRPayload) => api.post<PIRForm>('/pir', payload),
  getByID: (id: string) => api.get<PIRForm>(`/pir/${id}`),
  getByProyekID: (proyekId: string) => api.get<PIRForm | null>(`/pir?proyek_id=${proyekId}`),
  update: (id: string, payload: UpdatePIRPayload) =>
    api.put<{ message: string }>(`/pir/${id}`, payload),
};
