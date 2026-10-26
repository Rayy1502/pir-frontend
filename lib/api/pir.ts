import { api } from './client';
import {
  PIRForm,
  CreatePIRPayload,
  UpdatePIRPayload,
  SubmitSurveyPayload,
  SurveyResponse,
} from '@/types/pir';

export const pirApi = {
  create: (payload: CreatePIRPayload) => api.post<PIRForm>('/pir', payload),
  getByID: (id: string) => api.get<PIRForm>(`/pir/${id}`),
  getByProyekID: (proyekId: string) =>
    api.get<PIRForm | null>(`/pir?proyek_id=${proyekId}`),
  update: (id: string, payload: UpdatePIRPayload) =>
    api.put<{ message: string }>(`/pir/${id}`, payload),

  // Step 2 Survey
  getSurvey: (pirId: string) => api.get<SurveyResponse>(`/pir/${pirId}/survey`),
  submitSurvey: (pirId: string, payload: SubmitSurveyPayload) =>
    api.post<{ message: string }>(`/pir/${pirId}/survey`, payload),

  // Approval (ACC PIR Review)
  approve: (pirId: string, payload?: { approved_by?: string }) =>
    api.put<{ message: string; approved_by: string }>(`/pir/${pirId}/approve`, payload),
};
