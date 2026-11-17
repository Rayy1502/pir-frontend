'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
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
  Info,
  BadgeCheck,
  TrendingUp,
  Cpu,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';
import { pirApi } from '@/lib/api/pir';
import type { PublicSurveyResponse, PublicSurveyQuestion, SurveyJawabanItem } from '@/types/pir';

const MANFAAT_OPTIONS = [
  { val: '10-30%', label: '10-30%', desc: 'Peningkatan kecil, sebagian besar masih seperti cara lama' },
  { val: '30-50%', label: '30-50%', desc: 'Sebagian sudah lebih baik, sebagian lagi masih seperti cara lama' },
  { val: '50-70%', label: '50-70%', desc: 'Sebagian besar sudah lebih baik dibandingkan cara lama' },
  { val: '70-90%', label: '70-90%', desc: 'Hampir seluruhnya sudah jauh lebih baik' },
  { val: '100%', label: '100%', desc: 'Seluruhnya sudah lebih baik, tidak ada lagi hambatan' },
];

const LIKERT_OPTIONS = [
  { val: 1, code: 'STS', label: 'Sangat Tidak Setuju' },
  { val: 2, code: 'TS', label: 'Tidak Setuju' },
  { val: 3, code: 'N', label: 'Netral' },
  { val: 4, code: 'S', label: 'Setuju' },
  { val: 5, code: 'SS', label: 'Sangat Setuju' },
];

function PublicSurveyContent() {
  const params = useParams();
  const pirId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<PublicSurveyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states: Identitas Responden
  const [namaResponden, setNamaResponden] = useState('');
  const [noBadge, setNoBadge] = useState('');
  const [jabatanResponden, setJabatanResponden] = useState('');
  const [unitKerjaResponden, setUnitKerjaResponden] = useState('');

  // Jawaban untuk seluruh butir pertanyaan (key = question id)
  const [answers, setAnswers] = useState<Record<string, { teks?: string; angka?: number }>>({});

  // Fallback states untuk format survey sederhana (4 pertanyaan lama)
  const [kepuasanLegacy, setKepuasanLegacy] = useState<number>(5);
  const [kesesuaianLegacy, setKesesuaianLegacy] = useState<number>(5);
  const [kendalaLegacy, setKendalaLegacy] = useState('');
  const [saranLegacy, setSaranLegacy] = useState('Ya');

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

  // Kelompokkan pertanyaan
  const questions = surveyData?.pertanyaan || [];
  const isFullStandard = questions.length >= 20;

  // Pertanyaan Skala Likert 1-20
  const likertQuestions = useMemo(() => {
    if (!isFullStandard) return [];
    return questions.filter((q) => q.tipe === 'skala' && q.urutan <= 20);
  }, [questions, isFullStandard]);

  // Sub-kelompok Likert berdasarkan urutan / kategori
  const groupedLikert = useMemo(() => {
    const groups: { title: string; subtitle: string; icon: any; items: PublicSurveyQuestion[] }[] = [
      {
        title: 'A. Kualitas Sistem, Akses, & Jaringan',
        subtitle: 'Kemudahan antarmuka, performa proses, keandalan sistem, dan stabilitas konektivitas kantor.',
        icon: Cpu,
        items: likertQuestions.filter((q) => q.urutan >= 1 && q.urutan <= 5),
      },
      {
        title: 'B. Kualitas Data & Informasi',
        subtitle: 'Akurasi, kemutakhiran (timeliness), kelengkapan, dan kejelasan informasi.',
        icon: FileSpreadsheet,
        items: likertQuestions.filter((q) => q.urutan >= 6 && q.urutan <= 9),
      },
      {
        title: 'C. Layanan & Dukungan Tim TI',
        subtitle: 'Waktu respons helpdesk, ketuntasan solusi teknis, dan pemahaman kebutuhan kerja pengguna.',
        icon: ShieldCheck,
        items: likertQuestions.filter((q) => q.urutan >= 10 && q.urutan <= 12),
      },
      {
        title: 'D. Adopsi & Kepuasan Pengguna',
        subtitle: 'Intensitas pemakaian tugas rutin, persepsi kebermanfaatan, dan kepuasan secara keseluruhan.',
        icon: Star,
        items: likertQuestions.filter((q) => q.urutan >= 13 && q.urutan <= 17),
      },
      {
        title: 'E. Dampak Kinerja & Efisiensi Pekerjaan',
        subtitle: 'Efisiensi waktu penyelesaian tugas, penurunan kesalahan data, dan dukungan pengambilan keputusan.',
        icon: TrendingUp,
        items: likertQuestions.filter((q) => q.urutan >= 18 && q.urutan <= 20),
      },
    ];
    return groups.filter((g) => g.items.length > 0);
  }, [likertQuestions]);

  // Pertanyaan Manfaat (Urutan 21 - 23 atau tipe pilihan dengan rentang %)
  const benefitQuestions = useMemo(() => {
    if (!isFullStandard) return [];
    return questions.filter((q) => q.urutan >= 21 && q.urutan <= 23);
  }, [questions, isFullStandard]);

  // Pertanyaan Kualitatif Terbuka (Urutan 24 - 25)
  const qualitativeQuestions = useMemo(() => {
    if (!isFullStandard) return [];
    return questions.filter((q) => q.urutan >= 24 && q.urutan <= 25);
  }, [questions, isFullStandard]);

  // Pertanyaan Tambahan Kustom Proyek (Urutan > 25)
  const customQuestions = useMemo(() => {
    if (!isFullStandard) return questions.filter((q) => q.urutan > 4);
    return questions.filter((q) => q.urutan > 25);
  }, [questions, isFullStandard]);

  // Hitung total pertanyaan yang harus dijawab
  const totalMandatory = useMemo(() => {
    if (isFullStandard) {
      return likertQuestions.length + benefitQuestions.length;
    }
    return 2;
  }, [isFullStandard, likertQuestions, benefitQuestions]);

  const answeredCount = useMemo(() => {
    let count = 0;
    if (isFullStandard) {
      for (const q of likertQuestions) {
        if (answers[q.id]?.angka !== undefined) count++;
      }
      for (const q of benefitQuestions) {
        if (answers[q.id]?.teks) count++;
      }
    }
    return count;
  }, [isFullStandard, likertQuestions, benefitQuestions, answers]);

  const handleSetAnswer = (qId: string, data: { teks?: string; angka?: number }) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], ...data },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaResponden.trim()) {
      alert('Mohon isi Nama Lengkap terlebih dahulu.');
      return;
    }

    if (!noBadge.trim()) {
      alert('Mohon isi No. Badge / NIK Anda.');
      return;
    }

    if (!unitKerjaResponden.trim()) {
      alert('Mohon isi Unit Kerja / Departemen Anda.');
      return;
    }

    // Validasi kelengkapan kuesioner skala Likert
    if (isFullStandard) {
      const unansweredLikert = likertQuestions.filter((q) => answers[q.id]?.angka === undefined);
      if (unansweredLikert.length > 0) {
        alert(
          `Masih ada ${unansweredLikert.length} pertanyaan skala evaluasi yang belum dijawab. Mohon lengkapi seluruh butir penilaian.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Kumpulkan seluruh jawaban
      const jawabanLain: SurveyJawabanItem[] = Object.entries(answers).map(([qId, ans]) => ({
        pertanyaan_id: qId,
        jawaban_teks: ans.teks,
        jawaban_angka: ans.angka,
      }));

      // Hitung skor agregat
      let finalKepuasan = 5;
      let finalKesesuaian = 5;
      let finalKendala = '';
      let finalSaran = '';

      if (isFullStandard) {
        // Pertanyaan #15 adalah "Secara keseluruhan, saya puas..."
        const q15 = questions.find((q) => q.urutan === 15);
        if (q15 && answers[q15.id]?.angka) {
          finalKepuasan = answers[q15.id].angka!;
        } else {
          // Rata-rata dari seluruh pertanyaan likert
          let sum = 0;
          let cnt = 0;
          for (const q of likertQuestions) {
            if (answers[q.id]?.angka) {
              sum += answers[q.id].angka!;
              cnt++;
            }
          }
          finalKepuasan = cnt > 0 ? Math.round(sum / cnt) : 5;
        }

        // Pertanyaan #17 adalah "Pengalaman saya sesuai dengan harapan..."
        const q17 = questions.find((q) => q.urutan === 17);
        if (q17 && answers[q17.id]?.angka) {
          finalKesesuaian = answers[q17.id].angka!;
        } else {
          finalKesesuaian = finalKepuasan;
        }

        // Pertanyaan #24 adalah perubahan cara kerja / kendala
        const q24 = questions.find((q) => q.urutan === 24);
        if (q24 && answers[q24.id]?.teks) {
          finalKendala = answers[q24.id].teks!;
        }

        // Pertanyaan #25 adalah saran pengembangan
        const q25 = questions.find((q) => q.urutan === 25);
        if (q25 && answers[q25.id]?.teks) {
          finalSaran = answers[q25.id].teks!;
        }
      } else {
        // Format legacy 4 pertanyaan
        finalKepuasan = kepuasanLegacy;
        finalKesesuaian = kesesuaianLegacy;
        finalKendala = kendalaLegacy;
        finalSaran = saranLegacy;
      }

      await pirApi.submitPublicSurvey(pirId, {
        nama_responden: namaResponden.trim(),
        no_badge: noBadge.trim(),
        jabatan_responden: jabatanResponden.trim(),
        unit_kerja_responden: unitKerjaResponden.trim(),
        kepuasan: finalKepuasan,
        kesesuaian_tujuan: finalKesesuaian,
        kendala: finalKendala.trim(),
        saran: finalSaran.trim(),
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
        <p className="text-gray-600 font-medium">Memuat formulir evaluasi PIR PT PUSRI...</p>
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
            Review Berhasil Disimpan!
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Terima kasih banyak atas partisipasi <strong className="text-gray-800">{namaResponden}</strong> (Badge: {noBadge || '-'}).
            Evaluasi dan umpan balik yang Anda berikan telah tersimpan secara resmi ke dalam sistem{' '}
            <strong>Post Implementation Review (PIR)</strong> PT Pupuk Sriwidjaja Palembang.
          </p>

          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-left text-sm space-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Kegiatan Proyek:</span>
              <span className="font-semibold text-gray-800">{surveyData?.nama_kegiatan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">No. Badge / NIK:</span>
              <span className="font-bold text-blue-700">{noBadge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit Kerja / Departemen:</span>
              <span className="font-medium text-gray-700">{unitKerjaResponden}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status Form:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Terverifikasi Masuk
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Divisi Teknologi Informasi — PT Pupuk Sriwidjaja Palembang
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Branding PUSRI */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-emerald-800 p-6 sm:p-8 text-white relative">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-200 flex items-center gap-1.5">
                <Sparkles size={13} />
                PT Pupuk Sriwidjaja Palembang
              </span>
              <span className="bg-emerald-500/30 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium">
                Divisi Teknologi Informasi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Post Implementation Review (PIR)
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Kuesioner ini bertujuan menilai pengalaman dan kepuasan pengguna terhadap{' '}
              <strong className="text-emerald-300 font-semibold">{surveyData?.nama_kegiatan}</strong> setelah aplikasi
              digunakan, untuk mengetahui bagian yang sudah baik dan yang perlu dikembangkan.
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
                {surveyData?.vendor || 'Tim Internal Divisi TI'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Tanggal Operasional / Go-Live
              </p>
              <p className="font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                {surveyData?.tanggal_go_live || '-'}
              </p>
            </div>
          </div>

          {/* Progress Indikator untuk Survey Standar */}
          {isFullStandard && (
            <div className="bg-emerald-50/60 px-6 py-3 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <ClipboardCheck size={15} className="text-emerald-600" />
                Progres Pengisian Evaluasi:
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (answeredCount / totalMandatory) * 100)}%` }}
                  />
                </div>
                <span className="font-bold text-emerald-800 whitespace-nowrap">
                  {answeredCount} / {totalMandatory} Butir
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Pengisian Review */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================= */}
          {/* SEKSI 1: IDENTITAS RESPONDEN (DEMOGRAFI) */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                1
              </span>
              Identitas Responden / Narasumber
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              Data ini digunakan untuk melengkapi Berita Acara Evaluasi Post Implementation Review (PIR).
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
                  No. Badge / NIK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 890123 / P-10293"
                  value={noBadge}
                  onChange={(e) => setNoBadge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Departemen / Unit Kerja <span className="text-red-500">*</span>
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

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Jabatan / Peran Pengguna (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Staff Operasional / Key User / Koordinator Sistem"
                  value={jabatanResponden}
                  onChange={(e) => setJabatanResponden(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FORMAT PENILAIAN LENGKAP STANDAR (25 BUTIR GOOGLE FORM) */}
          {/* ========================================================= */}
          {isFullStandard ? (
            <>
              {/* SEKSI 2: PENILAIAN SKALA LIKERT 1-5 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Penilaian Pengalaman Pengguna (Skala Likert 1–5)
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                    Pilihlah tingkat persetujuan Anda terhadap setiap butir pernyataan berdasarkan pengalaman nyata
                    menggunakan aplikasi.
                  </p>
                </div>

                {/* Legend Skala Likert */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                    <Info size={15} />
                    Panduan Skala Penilaian:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {LIKERT_OPTIONS.map((opt) => (
                      <div
                        key={opt.val}
                        className="bg-white p-2 rounded-lg border border-blue-100 flex items-center gap-2 shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                          {opt.val}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-gray-800 text-[11px]">{opt.code}</p>
                          <p className="text-[10px] text-gray-500 truncate">{opt.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Kelompok Butir Pertanyaan Likert */}
                <div className="space-y-8">
                  {groupedLikert.map((group, gIdx) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={gIdx} className="space-y-4">
                        <div className="border-b border-gray-200 pb-2">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <GroupIcon size={16} className="text-emerald-600" />
                            {group.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{group.subtitle}</p>
                        </div>

                        <div className="space-y-4">
                          {group.items.map((q) => {
                            const selectedVal = answers[q.id]?.angka;
                            return (
                              <div
                                key={q.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  selectedVal !== undefined
                                    ? 'bg-slate-50/60 border-slate-200'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start gap-3 justify-between mb-3">
                                  <label className="text-sm font-semibold text-gray-800 leading-snug">
                                    <span className="text-emerald-700 font-bold mr-1.5">{q.urutan}.</span>
                                    {q.pertanyaan}
                                  </label>
                                  {selectedVal !== undefined && (
                                    <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Check size={12} /> Terjawab
                                    </span>
                                  )}
                                </div>

                                {/* 5 Likert Buttons */}
                                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                  {LIKERT_OPTIONS.map((opt) => {
                                    const isSelected = selectedVal === opt.val;
                                    return (
                                      <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => handleSetAnswer(q.id, { angka: opt.val })}
                                        className={`flex flex-col items-center justify-center py-2 px-1 sm:px-2 rounded-xl border-2 transition-all cursor-pointer ${
                                          isSelected
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                                        }`}
                                      >
                                        <span className="text-base font-extrabold">{opt.val}</span>
                                        <span className="text-[10px] font-semibold uppercase">{opt.code}</span>
                                        <span className="text-[9px] text-gray-500 text-center hidden md:block mt-0.5 leading-tight">
                                          {opt.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEKSI 3: MANFAAT YANG DIRASAKAN (BENEFIT REALIZATION) */}
              {benefitQuestions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      Manfaat yang Dirasakan Setelah Implementasi
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                      Nyatakan tingkat persetujuan Anda terhadap pernyataan berikut dibandingkan cara kerja sebelum
                      aplikasi digunakan. Pilih satu jawaban di setiap baris.
                    </p>
                  </div>

                  {/* Penjelasan Pilihan Manfaat */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs space-y-1.5 text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950 uppercase tracking-wider">
                      <Info size={14} /> Panduan Pilihan Persentase:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li><strong>10-30%</strong> = Peningkatannya kecil, sebagian besar masih seperti cara lama</li>
                      <li><strong>30-50%</strong> = Sebagian sudah lebih baik, sebagian lagi masih seperti cara lama</li>
                      <li><strong>50-70%</strong> = Sebagian besar sudah lebih baik dibandingkan cara lama</li>
                      <li><strong>70-90%</strong> = Hampir seluruhnya sudah jauh lebih baik</li>
                      <li><strong>100%</strong> = Seluruhnya sudah lebih baik, tidak ada lagi hambatan seperti pada cara lama</li>
                    </ul>
                  </div>

                  {/* Kisi Aspek Manfaat */}
                  <div className="space-y-4">
                    {benefitQuestions.map((q) => {
                      const selectedTeks = answers[q.id]?.teks;
                      return (
                        <div
                          key={q.id}
                          className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="text-sm font-bold text-gray-800">
                              <span className="text-teal-700 mr-1.5">{q.urutan}.</span>
                              {q.pertanyaan}
                            </label>
                            {selectedTeks && (
                              <span className="shrink-0 text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={12} /> {selectedTeks}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {MANFAAT_OPTIONS.map((opt) => {
                              const isSelected = selectedTeks === opt.val;
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => handleSetAnswer(q.id, { teks: opt.val })}
                                  className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  <span className="font-extrabold text-sm block mb-1">{opt.label}</span>
                                  <span className="text-[10px] text-gray-500 leading-tight block">
                                    {opt.desc}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEKSI 4: MASUKAN KUALITATIF & REKOMENDASI PENGEMBANGAN */}
              {qualitativeQuestions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm font-bold">
                        4
                      </span>
                      Evaluasi Kualitatif & Rekomendasi Modul
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                      Berikan masukan mendalam Anda untuk membantu Divisi TI menyempurnakan sistem pada iterasi
                      berikutnya.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {qualitativeQuestions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <label className="block text-sm font-bold text-gray-800 leading-snug">
                          <span className="text-indigo-700 mr-1.5">{q.urutan}.</span>
                          {q.pertanyaan}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={
                            q.urutan === 24
                              ? 'Uraikan apa yang berubah dalam cara Anda bekerja (lebih baik/lebih buruk), serta hal dari cara kerja lama yang belum tergantikan...'
                              : 'Tuliskan kebutuhan pengembangan, perbaikan bug, atau peningkatan modul. Jika tidak ada, tuliskan "Tidak ada"...'
                          }
                          value={answers[q.id]?.teks || ''}
                          onChange={(e) => handleSetAnswer(q.id, { teks: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ========================================================= */
            /* FORMAT FALLBACK SURVEY SEDERHANA (4 PERTANYAAN) */
            /* ========================================================= */
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
                      onClick={() => setKepuasanLegacy(item.val)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        kepuasanLegacy === item.val
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                      }`}
                    >
                      <Star
                        size={20}
                        className={
                          kepuasanLegacy >= item.val ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }
                      />
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
                  Apakah fitur dan fungsi sistem yang berjalan saat ini sesuai dengan target kebutuhan operasional unit
                  kerja?
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
                      onClick={() => setKesesuaianLegacy(item.val)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        kesesuaianLegacy === item.val
                          ? 'border-teal-600 bg-teal-50/70 text-teal-800 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                      }`}
                    >
                      <span className="text-lg font-bold">{item.val}</span>
                      <span className="text-[10px] text-center font-medium mt-1">{item.label}</span>
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
                  value={kendalaLegacy}
                  onChange={(e) => setKendalaLegacy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              {/* Pertanyaan 4: Saran */}
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
                      onClick={() => setSaranLegacy(item.val)}
                      className={`px-5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        saranLegacy === item.val
                          ? item.val === 'Ya'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                            : 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pertanyaan Kustom Tambahan Khusus Proyek (jika ada) */}
          {customQuestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                Pertanyaan Tambahan Khusus Proyek
              </h3>
              {customQuestions.map((cq) => (
                <div key={cq.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    {cq.urutan}. {cq.pertanyaan}
                  </label>

                  {cq.tipe === 'skala' ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSetAnswer(cq.id, { angka: num })}
                          className={`w-11 h-11 rounded-lg border font-bold text-sm flex items-center justify-center transition-all ${
                            answers[cq.id]?.angka === num
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
                          onClick={() => handleSetAnswer(cq.id, { teks: opt })}
                          className={`px-5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            answers[cq.id]?.teks === opt
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      placeholder="Tulis jawaban Anda di sini..."
                      value={answers[cq.id]?.teks || ''}
                      onChange={(e) => handleSetAnswer(cq.id, { teks: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tombol Submit Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>Review Anda akan langsung dikompilasi secara resmi ke Laporan PIR PT PUSRI.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Menyimpan Review...</span>
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
