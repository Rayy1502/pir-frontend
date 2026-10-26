'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare,
  ClipboardList,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Printer,
  Download,
  UploadCloud,
  FileCheck,
  Star,
  Check,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { pirApi } from '@/lib/api/pir';
import { laporanApi } from '@/lib/api/laporan';
import { tindakLanjutApi } from '@/lib/api/tindak_lanjut';
import { Proyek } from '@/types/proyek';
import {
  MetodePIR,
  PIRForm,
  CustomPertanyaanInput,
  LaporanPIR,
  TindakLanjut,
} from '@/types/pir';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StepItem {
  num: number;
  title: string;
  subtitle: string;
}

const STEPS: StepItem[] = [
  { num: 1, title: 'Pembuatan PIR', subtitle: 'Metode & Scope' },
  { num: 2, title: 'Form Survey', subtitle: 'Kuesioner Responden' },
  { num: 3, title: 'Laporan PIR', subtitle: 'Format Resmi PUSRI' },
  { num: 4, title: 'Tindak Lanjut', subtitle: 'Tracking Temuan & Bukti' },
];

function PIRFormWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProyekId = searchParams.get('proyek_id');
  const queryStep = searchParams.get('step');

  const [currentStep, setCurrentStep] = useState<number>(
    queryStep ? parseInt(queryStep, 10) : 1
  );

  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [selectedProyekId, setSelectedProyekId] = useState<string>(queryProyekId || '');
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [existingPIRId, setExistingPIRId] = useState<string | null>(null);

  // Mode Input Proyek Baru vs Pilih Proyek Eksisting
  const [isNewProject, setIsNewProject] = useState<boolean>(!queryProyekId);
  const [newNamaKegiatan, setNewNamaKegiatan] = useState('');
  const [newKategori, setNewKategori] = useState<'Aplikasi' | 'Infrastruktur' | 'EUC'>('Aplikasi');
  const [newUnitKerja, setNewUnitKerja] = useState('Infrastruktur');
  const [newTanggalGoLive, setNewTanggalGoLive] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Step 1: Inisiasi PIR
  const [vendor, setVendor] = useState('');
  const [tujuanAwal, setTujuanAwal] = useState('');
  const [metode, setMetode] = useState<MetodePIR>('observasi');
  const [catatanKondisi, setCatatanKondisi] = useState('');
  const [namaNarasumber, setNamaNarasumber] = useState('');
  const [jabatanNarasumber, setJabatanNarasumber] = useState('');
  const [daftarPertanyaan, setDaftarPertanyaan] = useState('');
  const [kesimpulanWawancara, setKesimpulanWawancara] = useState('');
  const [responden, setResponden] = useState('');

  // Step 2: Form Survey
  const [kepuasanSurvey, setKepuasanSurvey] = useState<number>(4);
  const [kesesuaianSurvey, setKesesuaianSurvey] = useState<number>(4);
  const [kendalaSurvey, setKendalaSurvey] = useState('');
  const [saranSurvey, setSaranSurvey] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomPertanyaanInput[]>([]);

  // Step 3: Laporan PIR
  const [existingLaporanId, setExistingLaporanId] = useState<string | null>(null);
  const [nomorPIRPreview, setNomorPIRPreview] = useState<string>('PIR/TI/2026/001');
  const [ringkasanLaporan, setRingkasanLaporan] = useState('');
  const [rekomendasiLaporan, setRekomendasiLaporan] = useState('');
  const [tanggalLaporan, setTanggalLaporan] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [temuanList, setTemuanList] = useState<string[]>([
    'Tingkat adopsi user telah mencapai target operasional awal.',
    'Dibutuhkan pelatihan lanjutan untuk modul pelaporan lanjutan.',
  ]);
  const [newTemuanInput, setNewTemuanInput] = useState('');

  // Step 4: Tindak Lanjut
  interface ActionItemDraft {
    id?: string;
    temuan: string;
    pic: string;
    target_selesai: string;
    status: 'open' | 'in_progress' | 'done';
    uploadedFiles: { id?: string; name: string; url?: string }[];
  }
  const [actionItems, setActionItems] = useState<ActionItemDraft[]>([]);

  // State status UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // 1. Fetch Daftar Proyek
  useEffect(() => {
    proyekApi
      .list()
      .then((res) => {
        const list = res || [];
        setProyekList(list);
        if (queryProyekId) {
          setSelectedProyekId(queryProyekId);
          setIsNewProject(false);
        } else if (list.length > 0) {
          setSelectedProyekId(list[0].id);
          setIsNewProject(false);
        } else {
          setIsNewProject(true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [queryProyekId]);

  // 2. Fetch Detail Proyek & Eksisting PIR
  useEffect(() => {
    if (!selectedProyekId) return;

    proyekApi
      .detail(selectedProyekId)
      .then((p) => {
        setProyek(p);
        setVendor(p.vendor || '');
      })
      .catch((err) => console.error(err));

    pirApi
      .getByProyekID(selectedProyekId)
      .then(async (pir) => {
        if (pir) {
          setExistingPIRId(pir.id);
          setTujuanAwal(pir.tujuan_awal || '');
          if (pir.metode) setMetode(pir.metode as MetodePIR);
          setCatatanKondisi(pir.catatan_kondisi || '');
          setNamaNarasumber(pir.nama_narasumber || '');
          setJabatanNarasumber(pir.jabatan_narasumber || '');
          setDaftarPertanyaan(pir.daftar_pertanyaan || '');
          setKesimpulanWawancara(pir.kesimpulan_wawancara || '');
          setResponden(pir.responden || '');

          // Ambil Survey jika sudah ada
          try {
            const surveyRes = await pirApi.getSurvey(pir.id);
            if (surveyRes) {
              if (surveyRes.kepuasan) setKepuasanSurvey(surveyRes.kepuasan);
              if (surveyRes.kesesuaian_tujuan)
                setKesesuaianSurvey(surveyRes.kesesuaian_tujuan);
              if (surveyRes.kendala) setKendalaSurvey(surveyRes.kendala);
              if (surveyRes.saran) setSaranSurvey(surveyRes.saran);

              if (surveyRes.pertanyaan && surveyRes.pertanyaan.length > 4) {
                const customOnly = surveyRes.pertanyaan.slice(4).map((q) => ({
                  pertanyaan: q.pertanyaan,
                  tipe: q.tipe,
                  jawaban_teks: q.jawaban?.jawaban_teks,
                  jawaban_angka: q.jawaban?.jawaban_angka,
                }));
                setCustomQuestions(customOnly);
              }
            }
          } catch (e) {
            // survey belum dibuat
          }

          // Ambil Laporan jika sudah ada
          try {
            const lapRes = await laporanApi.getByProyekID(selectedProyekId);
            if (lapRes) {
              setExistingLaporanId(lapRes.id);
              setNomorPIRPreview(lapRes.nomor_pir);
              setRingkasanLaporan(lapRes.ringkasan);
              setRekomendasiLaporan(lapRes.rekomendasi);
              setTanggalLaporan(lapRes.tanggal_laporan);
              if (lapRes.temuan && lapRes.temuan.length > 0) {
                setTemuanList(lapRes.temuan.map((t) => t.temuan));
              }

              // Ambil Tindak Lanjut terkait laporan ini
              const tlList = await tindakLanjutApi.list({ laporan_id: lapRes.id });
              if (tlList && tlList.length > 0) {
                setActionItems(
                  tlList.map((t) => ({
                    id: t.id,
                    temuan: t.temuan,
                    pic: t.pic,
                    target_selesai: t.target_selesai || '',
                    status: t.status,
                    uploadedFiles: (t.bukti || []).map((b) => ({
                      id: b.id,
                      name: b.nama_file,
                      url: b.url,
                    })),
                  }))
                );
              }
            }
          } catch (e) {
            // laporan belum dibuat
          }
        } else {
          setExistingPIRId(null);
          setExistingLaporanId(null);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedProyekId]);

  // Handle Step 1 Submit
  const handleSaveStep1 = async (proceed: boolean) => {
    if (isNewProject) {
      if (!newNamaKegiatan.trim()) {
        setMessage({ type: 'error', text: 'Nama kegiatan / proyek TI wajib diisi' });
        return;
      }
      if (!newTanggalGoLive) {
        setMessage({ type: 'error', text: 'Tanggal go live wajib diisi' });
        return;
      }
    } else {
      if (!selectedProyekId) {
        setMessage({ type: 'error', text: 'Pilih proyek terlebih dahulu atau buat proyek baru' });
        return;
      }
    }

    if (proceed) {
      if (!vendor.trim()) {
        setMessage({ type: 'error', text: 'Vendor / Tim Pengembang wajib diisi' });
        return;
      }
      if (!tujuanAwal.trim()) {
        setMessage({ type: 'error', text: 'Tujuan awal pengembangan wajib diisi' });
        return;
      }
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const status = proceed ? 'submitted' : 'draft';

      let currentProyekId = selectedProyekId;

      // Jika proyek baru, buat terlebih dahulu di tabel proyek (SSMS)
      if (isNewProject) {
        const createdProyek = await proyekApi.create({
          nama_kegiatan: newNamaKegiatan,
          kategori: newKategori,
          unit_kerja: newUnitKerja,
          vendor,
          tanggal_go_live: newTanggalGoLive,
        });
        currentProyekId = createdProyek.id;
        setSelectedProyekId(createdProyek.id);
        setProyek(createdProyek);
        setProyekList((prev) => [createdProyek, ...prev]);
        setIsNewProject(false);
      }

      let pirId = existingPIRId;
      if (pirId) {
        await pirApi.update(pirId, {
          vendor,
          tujuan_awal: tujuanAwal,
          metode,
          catatan_kondisi: catatanKondisi,
          nama_narasumber: namaNarasumber,
          jabatan_narasumber: jabatanNarasumber,
          daftar_pertanyaan: daftarPertanyaan,
          kesimpulan_wawancara: kesimpulanWawancara,
          responden,
          status,
        });
      } else {
        const res = await pirApi.create({
          proyek_id: currentProyekId,
          vendor,
          tujuan_awal: tujuanAwal,
          metode,
          catatan_kondisi: catatanKondisi,
          nama_narasumber: namaNarasumber,
          jabatan_narasumber: jabatanNarasumber,
          daftar_pertanyaan: daftarPertanyaan,
          kesimpulan_wawancara: kesimpulanWawancara,
          responden,
          status,
        });
        pirId = res.id;
        setExistingPIRId(res.id);
      }

      setMessage({
        type: 'success',
        text: proceed
          ? 'Step 1 berhasil disimpan. Melanjutkan ke Form Survey...'
          : 'Draft Step 1 berhasil disimpan.',
      });

      if (proceed) {
        setTimeout(() => {
          setCurrentStep(2);
          setMessage(null);
        }, 600);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan Step 1' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 2 Survey Submit
  const handleSaveStep2 = async (proceed: boolean) => {
    if (!existingPIRId) {
      setMessage({ type: 'error', text: 'Simpan Step 1 terlebih dahulu' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      await pirApi.submitSurvey(existingPIRId, {
        kepuasan: kepuasanSurvey,
        kesesuaian_tujuan: kesesuaianSurvey,
        kendala: kendalaSurvey,
        saran: saranSurvey,
        custom_pertanyaan: customQuestions,
      });

      // Sinkronisasi otomatis ke Step 3 jika form laporan masih kosong
      if (!ringkasanLaporan) {
        setRingkasanLaporan(
          `Berdasarkan hasil kuesioner dan evaluasi sistem bersama stakeholder: Tingkat kepuasan pengguna mencapai skor ${kepuasanSurvey}/5.0 dan kesesuaian implementasi dengan tujuan pengembangan dinilai mencapai ${(
            (kesesuaianSurvey / 5) *
            100
          ).toFixed(0)}%. ${kendalaSurvey ? `Catatan kendala: ${kendalaSurvey}.` : ''}`
        );
      }
      if (!rekomendasiLaporan && saranSurvey) {
        setRekomendasiLaporan(saranSurvey);
      }

      setMessage({
        type: 'success',
        text: proceed
          ? 'Hasil survey kuesioner berhasil dikirim! Menuju Step 3 (Laporan PIR)...'
          : 'Draft survey kuesioner berhasil disimpan.',
      });

      if (proceed) {
        setTimeout(() => {
          setCurrentStep(3);
          setMessage(null);
        }, 600);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan survey' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 3 Laporan Submit
  const handleSaveStep3 = async (proceed: boolean) => {
    if (!existingPIRId || !selectedProyekId) {
      setMessage({ type: 'error', text: 'Identitas PIR form belum lengkap' });
      return;
    }

    if (!ringkasanLaporan.trim()) {
      setMessage({ type: 'error', text: 'Ringkasan hasil evaluasi wajib diisi' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const kesesuaianPct = Math.round((kesesuaianSurvey / 5) * 100);

      const res = await laporanApi.create({
        proyek_id: selectedProyekId,
        pir_form_id: existingPIRId,
        ringkasan: ringkasanLaporan,
        kepuasan: Number(kepuasanSurvey.toFixed(1)),
        kesesuaian_tujuan: kesesuaianPct,
        rekomendasi: rekomendasiLaporan,
        tanggal_laporan: tanggalLaporan,
        temuan: temuanList.filter((t) => t.trim().length > 0),
      });

      setExistingLaporanId(res.id);
      setNomorPIRPreview(res.nomor_pir);

      // Pre-populate Action Items in Step 4 dari temuan jika belum ada
      if (actionItems.length === 0 && temuanList.length > 0) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const defaultDate = nextMonth.toISOString().split('T')[0];

        setActionItems(
          temuanList.map((t) => ({
            temuan: t,
            pic: 'Staff TI Pemilik',
            target_selesai: defaultDate,
            status: 'open',
            uploadedFiles: [],
          }))
        );
      }

      setMessage({
        type: 'success',
        text: proceed
          ? `Laporan PIR resmi (${res.nomor_pir}) berhasil diterbitkan! Melanjutkan ke Tindak Lanjut...`
          : `Laporan PIR resmi (${res.nomor_pir}) berhasil disimpan.`,
      });

      if (proceed) {
        setTimeout(() => {
          setCurrentStep(4);
          setMessage(null);
        }, 600);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan laporan PIR' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 4 Tindak Lanjut Submit
  const handleSaveStep4 = async (
    finalize: boolean,
    targetNav: 'dashboard' | 'detail' = 'dashboard'
  ) => {
    if (!existingLaporanId) {
      setMessage({ type: 'error', text: 'Laporan PIR harus dibuat terlebih dahulu di Step 3' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      for (const item of actionItems) {
        if (!item.temuan.trim()) continue;

        if (item.id) {
          await tindakLanjutApi.update(item.id, {
            temuan: item.temuan,
            pic: item.pic,
            target_selesai: item.target_selesai,
            status: item.status,
          });
        } else {
          const created = await tindakLanjutApi.create({
            laporan_id: existingLaporanId,
            temuan: item.temuan,
            pic: item.pic,
            target_selesai: item.target_selesai,
            status: item.status,
          });
          item.id = created.id;
        }
      }

      setMessage({
        type: 'success',
        text: finalize
          ? 'Tindak lanjut berhasil disimpan! Silakan lengkapi penandatanganan dan unggah bukti PDF di halaman detail proyek...'
          : 'Daftar tindak lanjut berhasil disimpan.',
      });

      if (finalize) {
        setTimeout(() => {
          router.push(`/proyek/${selectedProyekId}`);
        }, 1200);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan tindak lanjut' });
    } finally {
      setSubmitting(false);
    }
  };

  // Upload bukti file ke tindak lanjut
  const handleUploadBukti = async (
    index: number,
    file: File
  ) => {
    const item = actionItems[index];
    if (!item) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file melebihi 10MB!');
      return;
    }

    try {
      // Pastikan item sudah punya ID di DB
      let itemId = item.id;
      if (!itemId) {
        if (!existingLaporanId) {
          alert('Simpan Step 3 Laporan terlebih dahulu sebelum mengunggah bukti.');
          return;
        }
        const created = await tindakLanjutApi.create({
          laporan_id: existingLaporanId,
          temuan: item.temuan,
          pic: item.pic,
          target_selesai: item.target_selesai,
          status: item.status,
        });
        itemId = created.id;
        item.id = created.id;
      }

      const bukti = await tindakLanjutApi.uploadBukti(itemId, file);
      const updated = [...actionItems];
      updated[index].uploadedFiles.push({
        id: bukti.id,
        name: bukti.nama_file,
        url: bukti.url,
      });
      setActionItems(updated);
    } catch (err: any) {
      alert('Gagal mengunggah bukti: ' + err.message);
    }
  };

  // Cetak Dokumen Window Print
  const handlePrintDocument = () => {
    window.print();
  };

  // Download PDF dari API
  const handleDownloadPDF = async () => {
    if (!existingLaporanId) {
      alert('Simpan laporan terlebih dahulu untuk mengunduh PDF.');
      return;
    }
    try {
      const cleanNo = nomorPIRPreview.replace(/\//g, '_');
      await laporanApi.downloadPdf(existingLaporanId, `Laporan_${cleanNo}.pdf`);
    } catch (err: any) {
      alert('Gagal mengunduh PDF: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-sm text-gray-500 font-medium">Menyiapkan formulir evaluasi PIR...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-900 transition bg-white px-4 py-2 rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          Post Implementation Review — PT Pupuk Sriwidjaja Palembang
        </span>
      </div>

      {/* Step Tracker Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STEPS.map((st) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;

            return (
              <button
                type="button"
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/90 border-2 border-blue-600 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-50'
                    : 'bg-gray-50/70 border border-gray-100 hover:bg-gray-100/70'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition ${
                    isActive
                      ? 'bg-linear-to-br from-blue-700 to-indigo-800 text-white ring-2 ring-blue-300'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check size={18} strokeWidth={2.5} /> : st.num}
                </div>
                <div className="overflow-hidden">
                  <div
                    className={`text-xs font-bold leading-tight truncate ${
                      isActive ? 'text-blue-950' : isCompleted ? 'text-emerald-950' : 'text-gray-700'
                    }`}
                  >
                    {st.title}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{st.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm border shadow-xs animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Container */}
      <Card className="border border-gray-200/90 shadow-sm bg-white rounded-2xl overflow-hidden">
        {/* Header Bersama */}
        <CardHeader className="bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
                <Sparkles size={13} className="text-blue-600" />
                Tahap {currentStep} dari 4 — {STEPS[currentStep - 1]?.title}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {currentStep === 1 && 'Pembuatan Form PIR (Inisiasi)'}
                {currentStep === 2 && 'Form Survey & Kuesioner Responden'}
                {currentStep === 3 && 'Laporan Resmi Post Implementation Review'}
                {currentStep === 4 && 'Tindak Lanjut Temuan & Upload Bukti'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                {currentStep === 1 &&
                  'Lengkapi identitas proyek, lingkup tujuan awal, dan tentukan metode evaluasi PIR yang akan digunakan.'}
                {currentStep === 2 &&
                  'Kumpulkan penilaian kepuasan, kesesuaian target, kendala operasional, dan pertanyaan kustom.'}
                {currentStep === 3 &&
                  'Susun ringkasan temuan, skor evaluasi, dan cetak laporan resmi berformat kop surat PT PUSRI.'}
                {currentStep === 4 &&
                  'Tetapkan PIC penanggung jawab, tanggal target penyelesaian, serta lampirkan bukti fisik perbaikan.'}
              </CardDescription>
            </div>

            {/* Select Proyek jika ingin ganti atau Buat Proyek Baru */}
            <div className="w-full sm:w-80">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  {isNewProject ? 'Mode: Input Proyek Baru' : 'Pilih Proyek TI:'}
                </label>
                {proyekList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsNewProject(!isNewProject)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    {isNewProject ? '← Pilih Proyek Ada' : '+ Proyek Baru'}
                  </button>
                )}
              </div>
              {!isNewProject && proyekList.length > 0 ? (
                <select
                  value={selectedProyekId}
                  onChange={(e) => setSelectedProyekId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-800"
                >
                  {proyekList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_kegiatan}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-medium">
                  {proyekList.length === 0
                    ? 'Belum ada proyek di database. Silakan isi form di bawah.'
                    : 'Form di bawah akan mendaftarkan proyek baru ke database.'}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* ======================================================== */}
          {/* STEP 1: PEMBUATAN FORM PIR */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in">
              {/* Section 1: Identitas Proyek */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building size={16} className="text-blue-600" />
                  1. Identitas Proyek Pengembangan TI
                </h3>
                {isNewProject ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/40 p-4.5 rounded-xl border border-blue-200">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Kegiatan / Sistem TI <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newNamaKegiatan}
                        onChange={(e) => setNewNamaKegiatan(e.target.value)}
                        placeholder="Contoh: Sistem Informasi Logistik & Pergudangan Terpadu"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Kategori Pengembangan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={newKategori}
                        onChange={(e) => setNewKategori(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                      >
                        <option value="Aplikasi">Aplikasi</option>
                        <option value="Infrastruktur">Infrastruktur</option>
                        <option value="EUC">EUC (End User Computing)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unit Kerja Pemilik <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUnitKerja}
                        onChange={(e) => setNewUnitKerja(e.target.value)}
                        placeholder="Contoh: Infrastruktur / Layanan / Digitalisasi"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tanggal Go Live <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newTanggalGoLive}
                        onChange={(e) => setNewTanggalGoLive(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500">Nama Kegiatan</span>
                      <span className="text-sm font-bold text-gray-900">
                        {proyek?.nama_kegiatan || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500">Unit Kerja Pemilik</span>
                      <span className="text-sm font-bold text-gray-900">
                        {proyek?.unit_kerja || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500">Tanggal Go Live</span>
                      <span className="text-sm font-bold text-gray-900">
                        {proyek?.tanggal_go_live
                          ? new Date(proyek.tanggal_go_live).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Vendor & Tujuan */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  2. Lingkup & Pelaksana
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Vendor / Tim Pengembang <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="Contoh: PT Integrasi Logika Solusindo / Tim Internal TI"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tujuan Awal Pengembangan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={tujuanAwal}
                      onChange={(e) => setTujuanAwal(e.target.value)}
                      placeholder="Jelaskan kebutuhan bisnis atau latar belakang kenapa aplikasi/sistem ini dibangun..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pilihan Metode */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-600" />
                  3. Metode Evaluasi PIR
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'observasi',
                      title: 'Observasi Langsung',
                      desc: 'Pengecekan langsung operasional sistem di lapangan',
                      icon: Eye,
                    },
                    {
                      id: 'wawancara',
                      title: 'Wawancara Terarah',
                      desc: 'Tanya jawab mendalam dengan PIC narasumber unit',
                      icon: MessageSquare,
                    },
                    {
                      id: 'survey',
                      title: 'Survey / Kuesioner',
                      desc: 'Penyebaran formulir umpan balik ke banyak responden',
                      icon: FileSpreadsheet,
                    },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = metode === m.id;
                    return (
                      <label
                        key={m.id}
                        onClick={() => setMetode(m.id as MetodePIR)}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <input
                            type="radio"
                            name="metode_pir"
                            value={m.id}
                            checked={isSelected}
                            onChange={() => setMetode(m.id as MetodePIR)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <span className="font-bold text-sm text-gray-900">{m.title}</span>
                        <span className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {m.desc}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Sub-form Metode Observasi */}
                {metode === 'observasi' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Catatan Temuan Kondisi Lapangan
                    </label>
                    <textarea
                      rows={3}
                      value={catatanKondisi}
                      onChange={(e) => setCatatanKondisi(e.target.value)}
                      placeholder="Uraikan kondisi perangkat, antarmuka pengguna saat digunakan di lapangan..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Sub-form Metode Wawancara */}
                {metode === 'wawancara' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Nama Narasumber
                        </label>
                        <input
                          type="text"
                          value={namaNarasumber}
                          onChange={(e) => setNamaNarasumber(e.target.value)}
                          placeholder="Nama PIC / Pengguna Kunci"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Jabatan Narasumber
                        </label>
                        <input
                          type="text"
                          value={jabatanNarasumber}
                          onChange={(e) => setJabatanNarasumber(e.target.value)}
                          placeholder="Contoh: Manager Pengadaan Barang"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Daftar Pertanyaan & Kesimpulan Wawancara
                      </label>
                      <textarea
                        rows={2}
                        value={kesimpulanWawancara}
                        onChange={(e) => setKesimpulanWawancara(e.target.value)}
                        placeholder="Ringkasan poin penting masukan dari narasumber..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form Metode Survey */}
                {metode === 'survey' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Target Sasaran Responden
                    </label>
                    <input
                      type="text"
                      value={responden}
                      onChange={(e) => setResponden(e.target.value)}
                      placeholder="Contoh: Seluruh Staf Unit Pemohon & Operator Lapangan (Est. 25 Orang)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                    />
                    <p className="text-[11px] text-gray-400">
                      Pertanyaan survey kuesioner akan dikelola pada Step 2.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Step 1 */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => handleSaveStep1(false)}
                  className="rounded-xl font-semibold text-xs sm:text-sm"
                >
                  <Save size={16} className="mr-2" />
                  Simpan Draft Step 1
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveStep1(true)}
                  className="bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-semibold px-6 text-xs sm:text-sm shadow-md"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <ArrowRight size={16} className="mr-2" />
                  )}
                  Lanjut ke Step 2 (Form Survey)
                </Button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: FORM SURVEY & KUESIONER */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in">
              {/* Progress Bar Tersisa Pertanyaan */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Status Kelengkapan Survey
                    </h4>
                    <p className="text-xs text-blue-800">
                      Total {4 + customQuestions.length} pertanyaan evaluasi (4 standar + {customQuestions.length} kustom)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-36 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${
                          ((2 +
                            (kendalaSurvey ? 1 : 0) +
                            (saranSurvey ? 1 : 0)) /
                            (4 + customQuestions.length)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {Math.round(
                      ((2 +
                        (kendalaSurvey ? 1 : 0) +
                        (saranSurvey ? 1 : 0)) /
                        (4 + customQuestions.length)) *
                        100
                    )}
                    % Terisi
                  </span>
                </div>
              </div>

              {/* Pertanyaan 1: Skala Kepuasan */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 mb-1">
                      Pertanyaan #1 — Skala Kepuasan
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Bagaimana tingkat kepuasan pengguna akhir terhadap performa dan kemudahan sistem ini?
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold text-blue-700 border-blue-200">
                    Skor: {kepuasanSurvey} / 5
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {[
                    { val: 1, label: 'Sangat Tidak Puas' },
                    { val: 2, label: 'Kurang Puas' },
                    { val: 3, label: 'Cukup' },
                    { val: 4, label: 'Puas' },
                    { val: 5, label: 'Sangat Puas' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setKepuasanSurvey(item.val)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition cursor-pointer ${
                        kepuasanSurvey === item.val
                          ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Star
                        size={18}
                        className={kepuasanSurvey === item.val ? 'fill-amber-300 text-amber-300' : 'text-gray-400'}
                      />
                      <span className="font-bold text-base mt-1">{item.val}</span>
                      <span className="text-[10px] truncate max-w-full font-medium mt-0.5">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pertanyaan 2: Kesesuaian Hasil dengan Tujuan */}
              <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-1">
                      Pertanyaan #2 — Kesesuaian Tujuan
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Sejauh mana hasil implementasi sistem telah sesuai dengan target awal pengembangan?
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold text-emerald-700 border-emerald-200">
                    Kesesuaian: {((kesesuaianSurvey / 5) * 100).toFixed(0)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {[
                    { val: 1, label: 'Sangat Rendah (20%)' },
                    { val: 2, label: 'Kurang (40%)' },
                    { val: 3, label: 'Cukup (60%)' },
                    { val: 4, label: 'Tinggi (80%)' },
                    { val: 5, label: 'Sangat Sesuai (100%)' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setKesesuaianSurvey(item.val)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition cursor-pointer ${
                        kesesuaianSurvey === item.val
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-md'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-bold text-base">{item.val}</span>
                      <span className="text-[10px] truncate max-w-full font-medium mt-0.5">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pertanyaan 3 & 4: Kendala & Saran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                    Pertanyaan #3 — Kendala
                  </span>
                  <label className="block text-xs font-bold text-gray-800">
                    Kendala Teknis atau Operasional yang Dihadapi:
                  </label>
                  <textarea
                    rows={4}
                    value={kendalaSurvey}
                    onChange={(e) => setKendalaSurvey(e.target.value)}
                    placeholder="Contoh: Kecepatan sync database saat jam sibuk, beberapa user butuh panduan manual tambahan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                    Pertanyaan #4 — Saran Perbaikan
                  </span>
                  <label className="block text-xs font-bold text-gray-800">
                    Saran Perbaikan & Harapan Pengembangan Selanjutnya:
                  </label>
                  <textarea
                    rows={4}
                    value={saranSurvey}
                    onChange={(e) => setSaranSurvey(e.target.value)}
                    placeholder="Contoh: Penambahan dashboard eksekutif dan otomasi notifikasi email ke pimpinan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pertanyaan Kustom Dinamis */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-600" />
                    Pertanyaan Kustom Tambahan (Opsional)
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCustomQuestions((prev) => [
                        ...prev,
                        {
                          pertanyaan: '',
                          tipe: 'teks',
                          jawaban_teks: '',
                        },
                      ])
                    }
                    className="text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50 rounded-xl"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Tambah Pertanyaan
                  </Button>
                </div>

                {customQuestions.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                    Belum ada pertanyaan kustom. Klik tombol "+ Tambah Pertanyaan" jika ada kuesioner spesifik untuk proyek ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-gray-600">
                            Pertanyaan Kustom #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={q.tipe}
                              onChange={(e) => {
                                const updated = [...customQuestions];
                                updated[idx].tipe = e.target.value as any;
                                setCustomQuestions(updated);
                              }}
                              className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg font-semibold"
                            >
                              <option value="teks">Isian Teks</option>
                              <option value="skala">Skala 1 - 5</option>
                              <option value="pilihan">Pilihan Ya / Tidak</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = customQuestions.filter((_, i) => i !== idx);
                                setCustomQuestions(updated);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={q.pertanyaan}
                          onChange={(e) => {
                            const updated = [...customQuestions];
                            updated[idx].pertanyaan = e.target.value;
                            setCustomQuestions(updated);
                          }}
                          placeholder="Ketikkan teks pertanyaan kustom..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                        />

                        {q.tipe === 'teks' && (
                          <textarea
                            rows={2}
                            value={q.jawaban_teks || ''}
                            onChange={(e) => {
                              const updated = [...customQuestions];
                              updated[idx].jawaban_teks = e.target.value;
                              setCustomQuestions(updated);
                            }}
                            placeholder="Jawaban responden..."
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white"
                          />
                        )}

                        {q.tipe === 'skala' && (
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  const updated = [...customQuestions];
                                  updated[idx].jawaban_angka = num;
                                  setCustomQuestions(updated);
                                }}
                                className={`w-8 h-8 rounded-lg font-bold text-xs border ${
                                  q.jawaban_angka === num
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.tipe === 'pilihan' && (
                          <div className="flex items-center gap-2">
                            {['Ya', 'Tidak'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const updated = [...customQuestions];
                                  updated[idx].jawaban_teks = opt;
                                  setCustomQuestions(updated);
                                }}
                                className={`px-4 py-1.5 rounded-lg font-bold text-xs border ${
                                  q.jawaban_teks === opt
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Step 2 */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-xl font-semibold text-xs sm:text-sm"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Kembali ke Step 1
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleSaveStep2(false)}
                    className="rounded-xl font-semibold text-xs sm:text-sm"
                  >
                    <Save size={16} className="mr-2" />
                    Simpan Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveStep2(true)}
                    className="bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-semibold px-6 text-xs sm:text-sm shadow-md"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <ArrowRight size={16} className="mr-2" />
                    )}
                    Kirim Survey & Lanjut ke Step 3
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: LAPORAN PIR & FORMAT RESMI PUSRI */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in">
              {/* Form Input Laporan */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nomor PIR Dokumen (Auto Generate):
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={nomorPIRPreview}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-bold text-blue-900 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tanggal Laporan Resmi:
                    </label>
                    <input
                      type="date"
                      value={tanggalLaporan}
                      onChange={(e) => setTanggalLaporan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Ringkasan Hasil Evaluasi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={ringkasanLaporan}
                    onChange={(e) => setRingkasanLaporan(e.target.value)}
                    placeholder="Uraikan kesimpulan umum keberhasilan, utilisasi, dan penerimaan sistem..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Temuan Utama */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Daftar Temuan Utama Evaluasi
                    </label>
                    <span className="text-xs text-gray-400">
                      Temuan ini akan diteruskan menjadi item tindak lanjut di Step 4
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {temuanList.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={t}
                          onChange={(e) => {
                            const updated = [...temuanList];
                            updated[idx] = e.target.value;
                            setTemuanList(updated);
                          }}
                          className="flex-1 bg-transparent border-none outline-none font-medium text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTemuanList(temuanList.filter((_, i) => i !== idx));
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTemuanInput}
                      onChange={(e) => setNewTemuanInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTemuanInput.trim()) {
                          e.preventDefault();
                          setTemuanList([...temuanList, newTemuanInput.trim()]);
                          setNewTemuanInput('');
                        }
                      }}
                      placeholder="Ketik temuan baru lalu tekan Tambah..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newTemuanInput.trim()) {
                          setTemuanList([...temuanList, newTemuanInput.trim()]);
                          setNewTemuanInput('');
                        }
                      }}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Plus size={14} className="mr-1" />
                      Tambah Temuan
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Rekomendasi Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={rekomendasiLaporan}
                    onChange={(e) => setRekomendasiLaporan(e.target.value)}
                    placeholder="Rekomendasi langkah mitigasi dan optimalisasi sistem..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW FORMAT RESMI PUSRI */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Printer size={16} className="text-blue-600" />
                    Preview Cetak Dokumen Resmi PT PUSRI
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrintDocument}
                      className="rounded-xl text-xs font-semibold text-gray-700"
                    >
                      <Printer size={14} className="mr-1.5" />
                      Cetak Dokumen
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                      className="rounded-xl text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Download size={14} className="mr-1.5" />
                      Unduh PDF Resmi
                    </Button>
                  </div>
                </div>

                {/* Kertas Dokumen Cetak */}
                <div className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-gray-300 shadow-md font-serif text-gray-800 space-y-6">
                  {/* Kop Surat */}
                  <div className="text-center border-b-2 border-blue-900 pb-4 space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold tracking-wide text-blue-950 uppercase font-sans">
                      PT PUPUK SRIWIDJAJA PALEMBANG
                    </h2>
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-800 tracking-wider font-sans">
                      DIVISI TEKNOLOGI INFORMASI
                    </h3>
                    <p className="text-[11px] text-gray-500 font-sans">
                      Jl. Mayor Zen, Palembang 30118, Sumatera Selatan | Telp: (0711) 712222 | ti@pusri.co.id
                    </p>
                  </div>

                  {/* Header Judul */}
                  <div className="text-center space-y-1">
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 uppercase underline tracking-wide">
                      LAPORAN POST IMPLEMENTATION REVIEW (PIR)
                    </h1>
                    <p className="text-xs text-gray-600 font-mono">
                      Nomor: {nomorPIRPreview}
                    </p>
                  </div>

                  {/* Tabel Metadata */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden text-xs">
                    <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border-b border-gray-300 font-sans uppercase">
                      A. Informasi Proyek Pengembangan TI
                    </div>
                    <table className="w-full font-sans">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-1.5 font-bold text-gray-600 w-44">Nama Kegiatan</td>
                          <td className="px-3 py-1.5 text-gray-900 font-semibold">{proyek?.nama_kegiatan || '-'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-1.5 font-bold text-gray-600">Unit Kerja Pemilik</td>
                          <td className="px-3 py-1.5">{proyek?.unit_kerja || '-'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-1.5 font-bold text-gray-600">Vendor / Pengembang</td>
                          <td className="px-3 py-1.5">{vendor || '-'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-1.5 font-bold text-gray-600">Tanggal Go Live</td>
                          <td className="px-3 py-1.5">{proyek?.tanggal_go_live || '-'}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 font-bold text-gray-600">Metode Evaluasi</td>
                          <td className="px-3 py-1.5 capitalize font-semibold text-blue-700">{metode}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Ringkasan & Skor */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border border-gray-300 rounded-t-lg uppercase">
                      B. Ringkasan & Indikator Keberhasilan
                    </div>
                    <div className="border-x border-b border-gray-300 p-4 -mt-3 rounded-b-lg space-y-3 bg-white">
                      <p className="leading-relaxed text-gray-700">
                        {ringkasanLaporan || 'Belum diisi.'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="block text-[11px] text-gray-500 font-bold uppercase">
                            Skor Kepuasan Pengguna
                          </span>
                          <span className="text-lg font-bold text-blue-900">
                            {kepuasanSurvey.toFixed(1)} / 5.0
                          </span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="block text-[11px] text-gray-500 font-bold uppercase">
                            Kesesuaian Target Tujuan
                          </span>
                          <span className="text-lg font-bold text-emerald-900">
                            {((kesesuaianSurvey / 5) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Temuan Utama */}
                  <div className="space-y-2 font-sans text-xs">
                    <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border border-gray-300 rounded-t-lg uppercase">
                      C. Temuan Utama Evaluasi
                    </div>
                    <div className="border-x border-b border-gray-300 p-4 -mt-2 rounded-b-lg bg-white">
                      {temuanList.length === 0 ? (
                        <p className="text-gray-400 italic">Tidak ada temuan khusus.</p>
                      ) : (
                        <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                          {temuanList.map((t, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {t}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>

                  {/* Rekomendasi */}
                  <div className="space-y-2 font-sans text-xs">
                    <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border border-gray-300 rounded-t-lg uppercase">
                      D. Rekomendasi Tindak Lanjut
                    </div>
                    <div className="border-x border-b border-gray-300 p-4 -mt-2 rounded-b-lg bg-white">
                      <p className="leading-relaxed text-gray-700">
                        {rekomendasiLaporan ||
                          'Menindaklanjuti seluruh temuan PIR bersama PIC terkait sesuai target waktu yang ditetapkan.'}
                      </p>
                    </div>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="pt-8 flex justify-end font-sans text-xs">
                    <div className="text-center w-60 space-y-12">
                      <div>
                        Palembang, {tanggalLaporan}
                        <br />
                        <strong>Disusun oleh,</strong>
                      </div>
                      <div>
                        <div className="font-bold underline text-gray-900">
                          Budi Santoso
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          Divisi Teknologi Informasi PT PUSRI
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Step 3 */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-xl font-semibold text-xs sm:text-sm"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Kembali ke Step 2
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleSaveStep3(false)}
                    className="rounded-xl font-semibold text-xs sm:text-sm"
                  >
                    <Save size={16} className="mr-2" />
                    Simpan Laporan
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveStep3(true)}
                    className="bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-semibold px-6 text-xs sm:text-sm shadow-md"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <ArrowRight size={16} className="mr-2" />
                    )}
                    Terbitkan & Lanjut ke Step 4 (Tindak Lanjut)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: TINDAK LANJUT & UPLOAD BUKTI */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Daftar Tindak Lanjut Temuan PIR
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pastikan setiap temuan evaluasi memiliki penanggung jawab (PIC) dan target tanggal selesai.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setDate(nextMonth.getDate() + 30);
                    setActionItems([
                      ...actionItems,
                      {
                        temuan: '',
                        pic: 'Staff TI Pemilik',
                        target_selesai: nextMonth.toISOString().split('T')[0],
                        status: 'open',
                        uploadedFiles: [],
                      },
                    ]);
                  }}
                  className="rounded-xl text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Plus size={14} className="mr-1.5" />
                  Tambah Item Tindak Lanjut
                </Button>
              </div>

              {actionItems.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                  <ClipboardList size={36} className="mx-auto text-gray-400" />
                  <p className="text-sm font-bold text-gray-700">Belum Ada Item Tindak Lanjut</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Klik tombol Tambah di atas untuk mendefinisikan komitmen perbaikan tindak lanjut.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-600 uppercase">
                            Temuan / Rekomendasi
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status Dropdown */}
                          <select
                            value={item.status}
                            onChange={(e) => {
                              const updated = [...actionItems];
                              updated[idx].status = e.target.value as any;
                              setActionItems(updated);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${
                              item.status === 'done'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.status === 'in_progress'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="open">Open (Belum Dimulai)</option>
                            <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                            <option value="done">Done (Selesai)</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setActionItems(actionItems.filter((_, i) => i !== idx));
                            }}
                            className="text-gray-400 hover:text-rose-600 p-1.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Input Temuan */}
                      <textarea
                        rows={2}
                        value={item.temuan}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx].temuan = e.target.value;
                          setActionItems(updated);
                        }}
                        placeholder="Uraikan temuan atau perbaikan yang harus dilakukan..."
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                      />

                      {/* PIC & Target Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Person In Charge (PIC):
                          </label>
                          <input
                            type="text"
                            value={item.pic}
                            onChange={(e) => {
                              const updated = [...actionItems];
                              updated[idx].pic = e.target.value;
                              setActionItems(updated);
                            }}
                            placeholder="Contoh: Budi Santoso (Staff TI) / Vendor"
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Target Selesai:
                          </label>
                          <input
                            type="date"
                            value={item.target_selesai}
                            onChange={(e) => {
                              const updated = [...actionItems];
                              updated[idx].target_selesai = e.target.value;
                              setActionItems(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white font-medium"
                          />
                        </div>
                      </div>

                      {/* Dropzone Upload Bukti */}
                      <div className="pt-2 border-t border-gray-100">
                        <span className="block text-[11px] font-bold text-gray-600 mb-1.5">
                          Bukti Penyelesaian (PDF, Foto, Laporan - Maks 10 MB):
                        </span>

                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 cursor-pointer text-xs font-semibold text-blue-800 transition">
                            <UploadCloud size={16} className="text-blue-600" />
                            <span>Unggah File Bukti</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadBukti(idx, f);
                              }}
                            />
                          </label>

                          {/* Daftar file yang sudah terunggah */}
                          {item.uploadedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.uploadedFiles.map((uf, fIdx) => (
                                <a
                                  key={fIdx}
                                  href={uf.url ? `http://localhost:8080${uf.url}` : '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:underline"
                                >
                                  <FileCheck size={14} className="text-emerald-600" />
                                  <span className="max-w-35 truncate">{uf.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons Step 4 */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="rounded-xl font-semibold text-xs sm:text-sm"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Kembali ke Step 3
                </Button>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleSaveStep4(false)}
                    className="rounded-xl font-semibold text-xs sm:text-sm"
                  >
                    <Save size={16} className="mr-2" />
                    Simpan Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveStep4(true, 'dashboard')}
                    className="bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-semibold px-5 text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 size={16} className="mr-2" />
                    )}
                    Selesai & Ke Dashboard
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveStep4(true, 'detail')}
                    className="bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-semibold px-5 text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Eye size={16} className="mr-2" />
                    )}
                    Lihat Detail Proyek
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PIRFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }
    >
      <PIRFormWizard />
    </Suspense>
  );
}
