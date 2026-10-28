'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import {
  Building2,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  HelpCircle,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { pirApi } from '@/lib/api/pir';
import type { PublicSurveyResponse, PublicSurveyQuestion } from '@/types/pir';

function PublicSurveyContent() {
  const params = useParams();
  const pirId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<PublicSurveyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [namaResponden, setNamaResponden] = useState('');
  const [jabatanResponden, setJabatanResponden] = useState('');
  const [unitKerjaResponden, setUnitKerjaResponden] = useState('');

  const [kepuasan, setKepuasan] = useState<number>(5);
  const [kesesuaian, setKesesuaian] = useState<number>(5);
  const [kendala, setKendala] = useState('');
  const [saran, setSaran] = useState('');

  // Jawaban untuk pertanyaan tambahan (urutan >= 5)
  const [customAnswers, setCustomAnswers] = useState<Record<string, { teks?: string; angka?: number }>>({});

  useEffect(() => {
    if (!pirId) return;

    setLoading(true);
    pirApi
      .getPublicSurvey(pirId)
      .then((data) => {
        setSurveyData(data);
        if (data.unit_kerja) {
          setUnitKerjaResponden(data.unit_kerja);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat survey:', err);
        setError(err.message || 'Form survey tidak ditemukan atau tautan tidak valid.');
      })
      .finally(() => setLoading(false));
  }, [pirId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaResponden.trim()) {
      alert('Mohon isi Nama Responden terlebih dahulu.');
      return;
    }

    if (!unitKerjaResponden.trim()) {
      alert('Mohon isi Unit Kerja / Departemen Anda.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Siapkan jawaban pertanyaan tambahan
      const jawabanLain = Object.entries(customAnswers).map(([qId, ans]) => ({
        pertanyaan_id: qId,
        jawaban_teks: ans.teks,
        jawaban_angka: ans.angka,
      }));

      await pirApi.submitPublicSurvey(pirId, {
        nama_responden: namaResponden.trim(),
        jabatan_responden: jabatanResponden.trim(),
        unit_kerja_responden: unitKerjaResponden.trim(),
        kepuasan,
        kesesuaian_tujuan: kesesuaian,
        kendala: kendala.trim(),
        saran: saran.trim(),
        jawaban_lain: jawabanLain,
      });

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Gagal mengirim survey:', err);
      setError(err.message || 'Gagal mengirim evaluasi review. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat formulir evaluasi PIR...</p>
      </div>
    );
  }

  if (error && !surveyData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tautan Tidak Tersedia</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-xs text-gray-500">
            Pastikan tautan yang Anda dapatkan dari PIC Divisi TI sudah benar dan masih aktif.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-r from-emerald-500 via-teal-500 to-blue-600" />
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Review Berhasil Terkirim!
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Terima kasih banyak atas partisipasi <strong className="text-gray-800">{namaResponden}</strong>. Evaluasi dan masukan yang Anda berikan telah tersimpan secara resmi ke dalam sistem <strong>Post Implementation Review (PIR)</strong> PT Pupuk Sriwidjaja Palembang.
          </p>

          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Kegiatan Proyek:</span>
              <span className="font-semibold text-gray-800">{surveyData?.nama_kegiatan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tingkat Kepuasan:</span>
              <span className="font-bold text-emerald-600">{kepuasan} dari 5 Bintang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kesesuaian Kebutuhan:</span>
              <span className="font-bold text-teal-600">{kesesuaian} dari 5 Poin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit Kerja Responden:</span>
              <span className="font-medium text-gray-700">{unitKerjaResponden}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Divisi Teknologi Informasi — PT Pupuk Sriwidjaja Palembang
          </p>
        </div>
      </div>
    );
  }

  // Pisahkan pertanyaan kustom (urutan > 4) jika ada
  const customQuestions = (surveyData?.pertanyaan || []).filter((q) => q.urutan > 4);

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Branding PUSRI */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-emerald-800 p-6 sm:p-8 text-white relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-200 flex items-center gap-1.5">
                <Sparkles size={13} />
                PT Pupuk Sriwidjaja Palembang
              </span>
              <span className="bg-emerald-500/30 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium">
                Divisi Teknologi Informasi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kuesioner Evaluasi Pasca Implementasi (PIR)
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Formulir penilaian kepuasan dan efektivitas implementasi sistem TI untuk memastikan mutu serta perbaikan berkelanjutan.
            </p>
          </div>

          {/* Info Proyek Banner */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Nama Proyek / Aplikasi
              </p>
              <p className="font-bold text-gray-800 text-base flex items-center gap-2">
                <Layers size={18} className="text-emerald-600 shrink-0" />
                {surveyData?.nama_kegiatan}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Unit Kerja Terkait
              </p>
              <p className="font-semibold text-gray-800 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600 shrink-0" />
                {surveyData?.unit_kerja}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Tim Pengembang / Vendor
              </p>
              <p className="font-medium text-gray-700">
                {surveyData?.vendor || 'Tim Internal TI'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Tanggal Rilis Operasional
              </p>
              <p className="font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                {surveyData?.tanggal_go_live || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Pengisian Review */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Identitas Responden */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                1
              </span>
              Identitas Responden / Narasumber
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              Data ini digunakan untuk melengkapi Berita Acara Evaluasi Post Implementation Review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso / Rina Marlina"
                  value={namaResponden}
                  onChange={(e) => setNamaResponden(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unit Kerja / Departemen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Operasi / Pengadaan / SDM"
                  value={unitKerjaResponden}
                  onChange={(e) => setUnitKerjaResponden(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jabatan / Peran Pengguna
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Staff Operasional / Key User"
                  value={jabatanResponden}
                  onChange={(e) => setJabatanResponden(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penilaian Utama (Skala & Feedback) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                2
              </span>
              Penilaian & Ulasan Evaluasi Sistem
            </h2>

            {/* Pertanyaan 1: Tingkat Kepuasan */}
            <div className="border-b border-gray-100 pb-7">
              <label className="block text-base font-bold text-gray-800 mb-1">
                1. Tingkat Kepuasan Pengguna terhadap Sistem
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Seberapa puas Anda terhadap keandalan, antarmuka, dan performa sistem selama digunakan?
              </p>

              <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-lg">
                {[
                  { val: 1, label: 'Sangat Kurang' },
                  { val: 2, label: 'Kurang' },
                  { val: 3, label: 'Cukup' },
                  { val: 4, label: 'Puas' },
                  { val: 5, label: 'Sangat Puas' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setKepuasan(item.val)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      kepuasan === item.val
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-0.5 mb-1">
                      <Star
                        size={20}
                        className={
                          kepuasan >= item.val
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    </div>
                    <span className="text-lg font-bold">{item.val}</span>
                    <span className="text-[10px] text-center font-medium mt-0.5 hidden sm:block">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pertanyaan 2: Kesesuaian Hasil */}
            <div className="border-b border-gray-100 pb-7">
              <label className="block text-base font-bold text-gray-800 mb-1">
                2. Kesesuaian Hasil Implementasi dengan Tujuan Awal
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Apakah fitur dan fungsi sistem yang berjalan saat ini sesuai dengan target kebutuhan operasional unit kerja?
              </p>

              <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-lg">
                {[
                  { val: 1, label: '< 40%' },
                  { val: 2, label: '40% - 60%' },
                  { val: 3, label: '60% - 75%' },
                  { val: 4, label: '75% - 90%' },
                  { val: 5, label: '> 90%' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setKesesuaian(item.val)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      kesesuaian === item.val
                        ? 'border-teal-600 bg-teal-50/70 text-teal-800 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    <span className="text-lg font-bold">{item.val}</span>
                    <span className="text-[10px] text-center font-medium mt-1">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pertanyaan 3: Kendala */}
            <div className="border-b border-gray-100 pb-7">
              <label className="block text-base font-bold text-gray-800 mb-1">
                3. Kendala Operasional / Teknis yang Dihadapi
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Sebutkan bila ada kendala seperti eror bug, akses lambat, kesulitan pemakaian, atau integrasi data.
              </p>
              <textarea
                rows={3}
                placeholder="Tuliskan kendala yang Anda atau tim temui selama mengoperasikan sistem..."
                value={kendala}
                onChange={(e) => setKendala(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            {/* Pertanyaan 4: Saran Perbaikan / Tindak Lanjut */}
            <div>
              <label className="block text-base font-bold text-gray-800 mb-1">
                4. Saran Perbaikan dan Tindak Lanjut Sistem
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Apakah sistem ini memerlukan tindak lanjut perbaikan atau penyesuaian operasional ke depan?
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Ya (Perlu Tindak Lanjut)', val: 'Ya' },
                  { label: 'Tidak (Sudah Optimal)', val: 'Tidak' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSaran(item.val)}
                    className={`px-5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      saran === item.val
                        ? item.val === 'Ya'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                          : 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        saran === item.val
                          ? item.val === 'Ya'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-rose-600 bg-rose-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {saran === item.val && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                      )}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pertanyaan Tambahan Kustom PIC (jika ada) */}
            {customQuestions.length > 0 && (
              <div className="pt-6 border-t border-gray-200 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Pertanyaan Tambahan Khusus Proyek
                </h3>
                {customQuestions.map((cq, idx) => (
                  <div key={cq.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      {idx + 5}. {cq.pertanyaan}
                    </label>

                    {cq.tipe === 'skala' ? (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [cq.id]: { ...prev[cq.id], angka: num },
                              }))
                            }
                            className={`w-11 h-11 rounded-lg border font-bold text-sm flex items-center justify-center transition-all ${
                              customAnswers[cq.id]?.angka === num
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    ) : cq.tipe === 'pilihan' ? (
                      <div className="flex items-center gap-3">
                        {['Ya', 'Tidak'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setCustomAnswers((prev) => ({
                                ...prev,
                                [cq.id]: { ...prev[cq.id], teks: opt },
                              }))
                            }
                            className={`px-5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              customAnswers[cq.id]?.teks === opt
                                ? opt === 'Ya'
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                                  : 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                customAnswers[cq.id]?.teks === opt
                                  ? opt === 'Ya'
                                    ? 'border-emerald-600 bg-emerald-600'
                                    : 'border-rose-600 bg-rose-600'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {customAnswers[cq.id]?.teks === opt && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                              )}
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        rows={2}
                        placeholder="Tulis jawaban Anda di sini..."
                        value={customAnswers[cq.id]?.teks || ''}
                        onChange={(e) =>
                          setCustomAnswers((prev) => ({
                            ...prev,
                            [cq.id]: { ...prev[cq.id], teks: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Submit Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>Review Anda akan langsung diteruskan ke PIC Divisi TI PT PUSRI.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Mengirimkan Review...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Kirim Review & Evaluasi PIR</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function PublicSurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <Loader2 className="animate-spin text-emerald-600 mb-3" size={36} />
          <p className="text-sm text-gray-500 font-medium">Memuat survei...</p>
        </div>
      }
    >
      <PublicSurveyContent />
    </Suspense>
  );
}
