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
  saveQuestions: (pirId: string, payload: { pertanyaan: any[] }) =>
    api.post<{ message: string }>(`/pir/${pirId}/survey/questions`, payload),
  submitSurvey: (pirId: string, payload: SubmitSurveyPayload) =>
    api.post<{ message: string }>(`/pir/${pirId}/survey`, payload),

  // Public Survey for Respondents (No Auth)
  getPublicSurvey: (pirId: string) =>
    api.get<import('@/types/pir').PublicSurveyResponse>(`/public/survey/${pirId}`),
  submitPublicSurvey: (
    pirId: string,
    payload: import('@/types/pir').PublicSubmitSurveyPayload
  ) =>
    api.post<{ message: string }>(`/public/survey/${pirId}/submit`, payload),

  // Approval (ACC PIR Review)
  approve: (pirId: string, payload?: { approved_by?: string }) =>
    api.put<{ message: string; approved_by: string }>(`/pir/${pirId}/approve`, payload),

  // Step 2 Dokumentasi (Observasi & Wawancara)
  getDokumentasi: (pirId: string, kategori?: string) =>
    api.get<import('@/types/pir').PIRDokumentasi[]>(
      `/pir/${pirId}/dokumentasi${kategori ? `?kategori=${kategori}` : ''}`
    ),
  uploadDokumentasi: (
    pirId: string,
    file: File,
    kategori: 'observasi' | 'wawancara',
    keterangan?: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kategori', kategori);
    if (keterangan) formData.append('keterangan', keterangan);
    return api.upload<import('@/types/pir').PIRDokumentasi>(
      `/pir/${pirId}/dokumentasi`,
      formData
    );
  },
  deleteDokumentasi: (dokId: string) =>
    api.delete<{ message: string }>(`/pir/dokumentasi/${dokId}`),
};

