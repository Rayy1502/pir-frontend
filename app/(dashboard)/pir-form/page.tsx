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
  Copy,
  ExternalLink,
  Share2,
  RefreshCw,
  UserCheck,
  Users,
  Paperclip,
  Upload,
  Image,
  X,
  Pencil,
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
  RespondenDetail,
  PIRDokumentasi,
} from '@/types/pir';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTanggalIndo, formatDateOnly, summarizeFeedback, cleanAnonymizedText } from '@/lib/utils';

interface StepItem {
  num: number;
  title: string;
  subtitle: string;
}

const STEPS: StepItem[] = [
  { num: 1, title: 'Pembuatan PIR', subtitle: 'Metode & Scope' },
  { num: 2, title: 'Evaluasi & Review', subtitle: 'Observasi / Wawancara / Survei' },
  { num: 3, title: 'Laporan PIR', subtitle: 'Format Resmi PUSRI' },
  { num: 4, title: 'Tindak Lanjut', subtitle: 'Tracking Temuan & Bukti' },
];

export const PIR_STANDARD_QUESTIONS_SCOPE = [
  // A. Kualitas Sistem & Antarmuka
  { no: 1, judul: 'Saya bisa menemukan menu atau fitur yang saya cari dengan cepat, tanpa coba-coba atau bertanya ke rekan', tipe: 'skala' as const, kategori: 'Kualitas Sistem & Antarmuka' },
  { no: 2, judul: 'Proses di aplikasi (misal menyimpan, mencari) berjalan cepat sehingga tidak mengganggu pekerjaan saya', tipe: 'skala' as const, kategori: 'Kualitas Sistem & Antarmuka' },
  { no: 3, judul: 'Aplikasi ini jarang error, atau tidak bisa diakses pada jam kerja', tipe: 'skala' as const, kategori: 'Keandalan Sistem & Ketersediaan' },
  { no: 4, judul: 'Pada jam kerja, saya dapat tersambung ke aplikasi lewat jaringan kantor setiap kali saya membutuhkannya', tipe: 'skala' as const, kategori: 'Akses & Jaringan Kantor' },
  { no: 5, judul: 'Koneksi jaringan jarang terputus saat saya sedang mengisi, menyimpan, atau mengirim data di aplikasi', tipe: 'skala' as const, kategori: 'Akses & Jaringan Kantor' },

  // B. Kualitas Data & Informasi
  { no: 6, judul: 'Data yang saya gunakan dalam pekerjaan (angka, status, atau laporan) akurat dan sesuai dengan kondisi sebenarnya', tipe: 'skala' as const, kategori: 'Kualitas Data & Informasi' },
  { no: 7, judul: 'Data yang saya butuhkan selalu terbaru, tanpa keterlambatan pembaruan yang mengganggu pekerjaan', tipe: 'skala' as const, kategori: 'Kualitas Data & Informasi' },
  { no: 8, judul: 'Informasinya cukup lengkap sehingga saya tidak perlu mencari ke sumber lain untuk menyelesaikan tugas', tipe: 'skala' as const, kategori: 'Kualitas Data & Informasi' },
  { no: 9, judul: 'Informasi di layar bisa langsung saya pahami tanpa perlu penjelasan tambahan', tipe: 'skala' as const, kategori: 'Kualitas Data & Informasi' },

  // C. Layanan & Dukungan Tim TI
  { no: 10, judul: 'Saat saya melaporkan kendala, tim IT/helpdesk menanggapi dalam waktu yang wajar', tipe: 'skala' as const, kategori: 'Layanan & Dukungan TI' },
  { no: 11, judul: 'Solusi dari tim IT/helpdesk benar-benar menyelesaikan masalah saya, bukan solusi sementara atau masalah yang berulang', tipe: 'skala' as const, kategori: 'Layanan & Dukungan TI' },
  { no: 12, judul: 'Tim IT/helpdesk memahami kebutuhan kerja saya ketika saya meminta bantuan, pelatihan atau perubahan fitur', tipe: 'skala' as const, kategori: 'Layanan & Dukungan TI' },

  // D. Adopsi & Kepuasan Pengguna
  { no: 13, judul: 'Pekerjaan inti saya, saya kerjakan melalui aplikasi ini secara rutin', tipe: 'skala' as const, kategori: 'Adopsi & Penggunaan Sistem' },
  { no: 14, judul: 'Saya memakai aplikasi ini karena memang membantu pekerjaan, bukan sekadar karena diwajibkan', tipe: 'skala' as const, kategori: 'Adopsi & Penggunaan Sistem' },
  { no: 15, judul: 'Secara keseluruhan, saya puas dengan pengalaman memakai aplikasi ini dalam pekerjaan sehari-hari', tipe: 'skala' as const, kategori: 'Kepuasan Pengguna Keseluruhan' },
  { no: 16, judul: 'Saya puas dengan fitur utama yang tersedia', tipe: 'skala' as const, kategori: 'Kepuasan Pengguna Keseluruhan' },
  { no: 17, judul: 'Pengalaman saya memakai aplikasi ini sesuai dengan harapan saya sebelum mulai menggunakannya', tipe: 'skala' as const, kategori: 'Kesesuaian Ekspektasi Awal' },

  // E. Dampak Kinerja & Efisiensi Pekerjaan
  { no: 18, judul: 'Aplikasi ini mempersingkat waktu penyelesaian tugas saya dibandingkan cara sebelumnya', tipe: 'skala' as const, kategori: 'Dampak Kinerja & Efisiensi' },
  { no: 19, judul: 'Aplikasi ini mengurangi pekerjaan berulang atau kesalahan input yang sebelumnya sering terjadi', tipe: 'skala' as const, kategori: 'Dampak Kinerja & Efisiensi' },
  { no: 20, judul: 'Informasi dari aplikasi ini membantu saya mengambil keputusan atau tindakan dibandingkan sebelum ada aplikasi', tipe: 'skala' as const, kategori: 'Dampak Kinerja & Efisiensi' },

  // F. Evaluasi Dampak Manfaat (Pilihan %)
  { no: 21, judul: 'Manfaat Business (Peningkatan pendapatan, efisiensi biaya operasional)', tipe: 'pilihan' as const, kategori: 'Evaluasi Manfaat Implementasi' },
  { no: 22, judul: 'Manfaat Process (Efisiensi proses bisnis, mempercepat penyelesaian pekerjaan)', tipe: 'pilihan' as const, kategori: 'Evaluasi Manfaat Implementasi' },
  { no: 23, judul: 'Manfaat Regulatory (Pemenuhan aturan dan kepatuhan menjadi lebih baik)', tipe: 'pilihan' as const, kategori: 'Evaluasi Manfaat Implementasi' },

  // G. Masukan Kualitatif & Rekomendasi
  { no: 24, judul: 'Apa yang berubah dalam cara Anda bekerja dibandingkan sebelumnya (ditambah, dihilangkan, atau berubah caranya)? Sebutkan perubahan yang paling Anda rasakan...', tipe: 'teks' as const, kategori: 'Evaluasi Kualitatif & Perubahan' },
  { no: 25, judul: 'Tuliskan kebutuhan pengembangan, perbaikan, atau peningkatan modul. Jika tidak ada, tuliskan "Tidak ada"', tipe: 'teks' as const, kategori: 'Rekomendasi Peningkatan Modul' },
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

  // Step 1: Pejabat Pengesahan Dokumen PIR (Berita Acara)
  const [disiapkanOleh, setDisiapkanOleh] = useState('Budi Pratama');
  const [disiapkanJabatan, setDisiapkanJabatan] = useState('TKNO Perencanaan & Tata Kelola TI');
  const [direviewOleh, setDireviewOleh] = useState('Rahmat Hidayat');
  const [direviewJabatan, setDireviewJabatan] = useState('Senior Engineer Perencanaan & Tata Kelola TI');
  const [disetujuiOleh, setDisetujuiOleh] = useState('Ahmad Fauzi');
  const [disetujuiJabatan, setDisetujuiJabatan] = useState('VP Departemen Teknologi Informasi PSP');

  // Step 2: Form Survey, Pertanyaan, & Tautan Review
  const [kepuasanSurvey, setKepuasanSurvey] = useState<number>(4);
  const [kesesuaianSurvey, setKesesuaianSurvey] = useState<number>(4);
  const [kendalaSurvey, setKendalaSurvey] = useState('');
  const [saranSurvey, setSaranSurvey] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomPertanyaanInput[]>([]);
  const [isSurveySubmitted, setIsSurveySubmitted] = useState<boolean>(false);
  const [surveyRespondenName, setSurveyRespondenName] = useState<string>('');
  const [daftarResponden, setDaftarResponden] = useState<RespondenDetail[]>([]);
  const [totalResponden, setTotalResponden] = useState<number>(0);
  const [kepuasanAvg, setKepuasanAvg] = useState<number>(4);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [refreshingSurvey, setRefreshingSurvey] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showAllStandardQuestions, setShowAllStandardQuestions] = useState<boolean>(false);

  // Step 2: Dokumentasi (Observasi & Wawancara)
  const [dokumentasiList, setDokumentasiList] = useState<PIRDokumentasi[]>([]);
  const [uploadingDokumentasi, setUploadingDokumentasi] = useState<boolean>(false);
  const [dokKeterangan, setDokKeterangan] = useState<string>('');
  const [editingDokId, setEditingDokId] = useState<string | null>(null);
  const [editingDokText, setEditingDokText] = useState<string>('');

  // Step 3: Laporan PIR
  const [existingLaporanId, setExistingLaporanId] = useState<string | null>(null);
  const [nomorPIRPreview, setNomorPIRPreview] = useState<string>('PIR/TI/2026/001');
  const [ringkasanLaporan, setRingkasanLaporan] = useState('');
  const [rekomendasiLaporan, setRekomendasiLaporan] = useState('');
  const [tanggalLaporan, setTanggalLaporan] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [temuanList, setTemuanList] = useState<string[]>([]);
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

  // Helper untuk membersihkan state form PIR saat beralih proyek atau proyek baru
  const resetFormState = () => {
    setExistingPIRId(null);
    setTujuanAwal('');
    setMetode('observasi');
    setCatatanKondisi('');
    setNamaNarasumber('');
    setJabatanNarasumber('');
    setDaftarPertanyaan('');
    setKesimpulanWawancara('');
    setResponden('');
    setDisiapkanOleh('Budi Pratama');
    setDisiapkanJabatan('TKNO Perencanaan & Tata Kelola TI');
    setDireviewOleh('Rahmat Hidayat');
    setDireviewJabatan('Senior Engineer Perencanaan & Tata Kelola TI');
    setDisetujuiOleh('Ahmad Fauzi');
    setDisetujuiJabatan('VP Departemen Teknologi Informasi PSP');
    setIsSurveySubmitted(false);
    setSurveyRespondenName('');
    setDaftarResponden([]);
    setTotalResponden(0);
    setKepuasanAvg(4);
    setKepuasanSurvey(4);
    setKesesuaianSurvey(4);
    setKendalaSurvey('');
    setSaranSurvey('');
    setCustomQuestions([]);
    setShowManualInput(false);
    setDokumentasiList([]);
    setDokKeterangan('');
    setExistingLaporanId(null);
    setNomorPIRPreview('PIR/TI/2026/001');
    setRingkasanLaporan('');
    setRekomendasiLaporan('');
    setTanggalLaporan(new Date().toISOString().split('T')[0]);
    setTemuanList([]);
    setNewTemuanInput('');
    setActionItems([]);
    setMessage(null);
  };

  // Sinkronisasi Current Step dari URL Parameter (?step=1..4)
  useEffect(() => {
    if (queryStep) {
      const parsed = parseInt(queryStep, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
        setCurrentStep(parsed);
      }
    } else {
      setCurrentStep(1);
    }
  }, [queryStep, queryProyekId]);

  // Auto-dismiss floating toast message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    if (!selectedProyekId) {
      resetFormState();
      return;
    }

    // Reset form state saat beralih proyek agar data lama tidak tertinggal
    resetFormState();
    if (!queryStep) {
      setCurrentStep(1);
    }

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
          setDisiapkanOleh(pir.disiapkan_oleh || 'Budi Pratama');
          setDisiapkanJabatan(pir.disiapkan_jabatan || 'TKNO Perencanaan & Tata Kelola TI');
          setDireviewOleh(pir.direview_oleh || 'Rahmat Hidayat');
          setDireviewJabatan(pir.direview_jabatan || 'Senior Engineer Perencanaan & Tata Kelola TI');
          setDisetujuiOleh(pir.disetujui_oleh || 'Ahmad Fauzi');
          setDisetujuiJabatan(pir.disetujui_jabatan || 'VP Departemen Teknologi Informasi PSP');

          // Ambil Survey jika sudah ada
          try {
            const surveyRes = await pirApi.getSurvey(pir.id);
            if (surveyRes) {
              setIsSurveySubmitted(!!surveyRes.is_submitted);
              if (surveyRes.responden) setSurveyRespondenName(surveyRes.responden);
              if (surveyRes.kepuasan) setKepuasanSurvey(surveyRes.kepuasan);
              if (surveyRes.kesesuaian_tujuan)
                setKesesuaianSurvey(surveyRes.kesesuaian_tujuan);

              // Cari jawaban butir ke-3 (Kendala) dan ke-4 (Saran)
              const q3 = surveyRes.pertanyaan?.find((q) => q.urutan === 3);
              const q4 = surveyRes.pertanyaan?.find((q) => q.urutan === 4);

              const isDirectEval = pir.metode === 'observasi' || pir.metode === 'wawancara';
              if (isDirectEval) {
                setKendalaSurvey(q3?.jawaban?.jawaban_teks || surveyRes.kendala || '');
                setSaranSurvey(q4?.jawaban?.jawaban_teks || surveyRes.saran || '');
              } else {
                setKendalaSurvey(summarizeFeedback(surveyRes.kendala || q3?.jawaban?.jawaban_teks || ''));
                setSaranSurvey(summarizeFeedback(surveyRes.saran || q4?.jawaban?.jawaban_teks || ''));
              }

              if (surveyRes.daftar_responden) {
                setDaftarResponden(surveyRes.daftar_responden);
                setTotalResponden(surveyRes.total_responden || surveyRes.daftar_responden.length);
              }
              if (surveyRes.kepuasan_avg) {
                setKepuasanAvg(surveyRes.kepuasan_avg);
              }

              if (surveyRes.pertanyaan && surveyRes.pertanyaan.length > 0) {
                const threshold = surveyRes.pertanyaan.length >= 20 ? 25 : 4;
                const customOnly = surveyRes.pertanyaan
                  .filter((q) => q.urutan > threshold)
                  .map((q) => ({
                    id: q.id,
                    pertanyaan: q.pertanyaan,
                    tipe: q.tipe,
                    urutan: q.urutan,
                    kategori: q.kategori,
                    jawaban_teks: q.jawaban?.jawaban_teks,
                    jawaban_angka: q.jawaban?.jawaban_angka,
                  }));
                setCustomQuestions(customOnly);
              }
            }
          } catch (e) {
            // survey belum dibuat
          }

          // Ambil Dokumentasi PIR (Observasi & Wawancara) jika sudah ada
          try {
            const dokRes = await pirApi.getDokumentasi(pir.id);
            if (dokRes && dokRes.length > 0) {
              setDokumentasiList(dokRes);
              // Pulihkan keterangan berkas dari dokumentasi yang ada jika dokKeterangan belum diisi
              const matching = dokRes.filter((d) => d.kategori === pir.metode);
              const withDesc =
                matching.find((d) => d.keterangan && d.keterangan.trim() !== '') ||
                dokRes.find((d) => d.keterangan && d.keterangan.trim() !== '');
              if (withDesc?.keterangan) {
                setDokKeterangan(withDesc.keterangan);
              } else if (typeof window !== 'undefined') {
                const cached = localStorage.getItem(`pir_draft_dok_keterangan_${pir.id}`);
                if (cached) setDokKeterangan(cached);
              }
            } else if (typeof window !== 'undefined') {
              const cached = localStorage.getItem(`pir_draft_dok_keterangan_${pir.id}`);
              if (cached) setDokKeterangan(cached);
            }
          } catch (e) {
            // dokumentasi belum dibuat
          }

          // Ambil Laporan jika sudah ada
          try {
            const lapRes = await laporanApi.getByProyekID(selectedProyekId);
            if (lapRes) {
              setExistingLaporanId(lapRes.id);
              setNomorPIRPreview(lapRes.nomor_pir);
              setRingkasanLaporan(lapRes.ringkasan);
              setRekomendasiLaporan(lapRes.rekomendasi);
              setTanggalLaporan(formatDateOnly(lapRes.tanggal_laporan) || new Date().toISOString().split('T')[0]);
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
          // Proyek belum punya PIR, pastikan tetap bersih
          resetFormState();
        }
      })
      .catch((err) => {
        // Belum ada data PIR
        resetFormState();
      });
  }, [selectedProyekId, queryStep]);

  // Handle Step 1 Submit
  const handleSaveStep1 = async (proceed: boolean) => {
    if (isNewProject) {
      if (!newNamaKegiatan.trim()) {
        setMessage({ type: 'error', text: 'Nama kegiatan / proyek TI wajib diisi' });
        return;
      }
      if (!newTanggalGoLive) {
        setMessage({ type: 'error', text: 'Tanggal rilis wajib diisi' });
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
          disiapkan_oleh: disiapkanOleh,
          disiapkan_jabatan: disiapkanJabatan,
          direview_oleh: direviewOleh,
          direview_jabatan: direviewJabatan,
          disetujui_oleh: disetujuiOleh,
          disetujui_jabatan: disetujuiJabatan,
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
          disiapkan_oleh: disiapkanOleh,
          disiapkan_jabatan: disiapkanJabatan,
          direview_oleh: direviewOleh,
          direview_jabatan: direviewJabatan,
          disetujui_oleh: disetujuiOleh,
          disetujui_jabatan: disetujuiJabatan,
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

  // Salin Tautan Survey Kuesioner Responden
  const copySurveyLink = () => {
    if (!existingPIRId) {
      setMessage({ type: 'error', text: 'Simpan Step 1 terlebih dahulu untuk mendapatkan tautan survey' });
      return;
    }
    const url = `${window.location.origin}/survey/${existingPIRId}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Muat Ulang Status Pengisian Responden
  const refreshSurveyStatus = async () => {
    if (!existingPIRId) return;
    try {
      setRefreshingSurvey(true);
      const surveyRes = await pirApi.getSurvey(existingPIRId);
      if (surveyRes) {
        setIsSurveySubmitted(!!surveyRes.is_submitted);
        if (surveyRes.responden) setSurveyRespondenName(surveyRes.responden);
        if (surveyRes.kepuasan) setKepuasanSurvey(surveyRes.kepuasan);
        if (surveyRes.kesesuaian_tujuan) setKesesuaianSurvey(surveyRes.kesesuaian_tujuan);
        if (surveyRes.kendala) setKendalaSurvey(summarizeFeedback(surveyRes.kendala));
        if (surveyRes.saran) setSaranSurvey(summarizeFeedback(surveyRes.saran));
        if (surveyRes.daftar_responden) {
          setDaftarResponden(surveyRes.daftar_responden);
          setTotalResponden(surveyRes.total_responden || surveyRes.daftar_responden.length);
        }
        if (surveyRes.kepuasan_avg) {
          setKepuasanAvg(surveyRes.kepuasan_avg);
        }

        const count = surveyRes.total_responden || (surveyRes.daftar_responden ? surveyRes.daftar_responden.length : 0);
        if (count > 0) {
          setMessage({
            type: 'success',
            text: `Data respon diperbarui! ${count} responden telah memberikan penilaian review.`,
          });
        } else {
          setMessage({
            type: 'success',
            text: 'Status dicek: Belum ada review masuk dari responden melalui tautan publik.',
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal memperbarui status respon' });
    } finally {
      setRefreshingSurvey(false);
    }
  };

  // Handle Upload & Delete Dokumentasi (Observasi / Wawancara)
  const handleUploadDokumentasi = async (
    file: File,
    kategori: 'observasi' | 'wawancara',
    keteranganCustom?: string
  ) => {
    let formId = existingPIRId;
    if (!formId) {
      if (!selectedProyekId) {
        setMessage({ type: 'error', text: 'Pilih proyek terlebih dahulu.' });
        return;
      }
      try {
        setSubmitting(true);
        const createRes = await pirApi.create({
          proyek_id: selectedProyekId,
          vendor: vendor,
          tujuan_awal: tujuanAwal,
          metode: metode,
          catatan_kondisi: catatanKondisi,
          nama_narasumber: namaNarasumber,
          jabatan_narasumber: jabatanNarasumber,
          daftar_pertanyaan: daftarPertanyaan,
          kesimpulan_wawancara: kesimpulanWawancara,
          responden: responden,
          disiapkan_oleh: disiapkanOleh,
          disiapkan_jabatan: disiapkanJabatan,
          direview_oleh: direviewOleh,
          direview_jabatan: direviewJabatan,
          disetujui_oleh: disetujuiOleh,
          disetujui_jabatan: disetujuiJabatan,
          status: 'draft',
        });
        if (createRes && createRes.id) {
          formId = createRes.id;
          setExistingPIRId(createRes.id);
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Gagal inisiasi PIR: ' + err.message });
        setSubmitting(false);
        return;
      }
    }

    if (!formId) {
      setMessage({ type: 'error', text: 'Form PIR belum tersimpan.' });
      return;
    }

    try {
      setUploadingDokumentasi(true);
      setMessage(null);
      const ketToSave = (keteranganCustom || dokKeterangan || '').trim();
      await pirApi.uploadDokumentasi(formId, file, kategori, ketToSave);
      if (typeof window !== 'undefined' && ketToSave) {
        localStorage.setItem(`pir_draft_dok_keterangan_${formId}`, ketToSave);
      }
      const dokRes = await pirApi.getDokumentasi(formId);
      setDokumentasiList(dokRes || []);
      setMessage({ type: 'success', text: `Berkas dokumentasi "${file.name}" berhasil diunggah!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal mengunggah dokumentasi: ' + err.message });
    } finally {
      setUploadingDokumentasi(false);
      setSubmitting(false);
    }
  };

  const handleUpdateDokKeterangan = async (dokId: string, newKeterangan: string) => {
    try {
      await pirApi.updateDokumentasi(dokId, newKeterangan.trim());
      setDokumentasiList((prev) =>
        prev.map((d) => (d.id === dokId ? { ...d, keterangan: newKeterangan.trim() } : d))
      );
      if (typeof window !== 'undefined' && existingPIRId) {
        localStorage.setItem(`pir_draft_dok_keterangan_${existingPIRId}`, newKeterangan.trim());
      }
      setEditingDokId(null);
      setMessage({ type: 'success', text: 'Keterangan berkas berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal memperbarui keterangan: ' + err.message });
    }
  };

  const handleDeleteDokumentasi = async (dokId: string) => {
    try {
      await pirApi.deleteDokumentasi(dokId);
      setDokumentasiList((prev) => prev.filter((d) => d.id !== dokId));
      setMessage({ type: 'success', text: 'Dokumentasi berhasil dihapus.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal menghapus dokumentasi: ' + err.message });
    }
  };

  // Simpan Desain Pertanyaan
  const handleSaveQuestionsOnly = async () => {
    if (!existingPIRId) {
      setMessage({ type: 'error', text: 'Simpan Step 1 terlebih dahulu' });
      return;
    }
    try {
      setSubmitting(true);
      setMessage(null);

      const stdQ = PIR_STANDARD_QUESTIONS_SCOPE.map((q) => ({
        pertanyaan: q.judul,
        tipe: q.tipe,
        urutan: q.no,
        kategori: q.kategori,
      }));

      const allQ = [
        ...stdQ,
        ...customQuestions.map((cq, idx) => ({
          id: cq.id,
          pertanyaan: cq.pertanyaan,
          tipe: cq.tipe,
          urutan: 26 + idx,
          kategori: 'Pertanyaan Khusus Proyek',
        })),
      ];

      await pirApi.saveQuestions(existingPIRId, { pertanyaan: allQ });
      setMessage({
        type: 'success',
        text: 'Desain 25 butir kuesioner PIR standar berhasil disimpan! Tautan kuesioner siap dibagikan.',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan pertanyaan' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 2 Lanjut ke Step 3
  const handleSaveStep2 = async (proceed: boolean) => {
    if (!existingPIRId) {
      setMessage({ type: 'error', text: 'Simpan Step 1 terlebih dahulu' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      if (metode === 'observasi') {
        // 1. Update pir_form dengan catatan kondisi lapangan terkini
        await pirApi.update(existingPIRId, {
          vendor,
          tujuan_awal: tujuanAwal,
          metode: 'observasi',
          catatan_kondisi: catatanKondisi,
          status: 'submitted',
        });

        // 2. Simpan skor observasi teknis
        await pirApi.submitSurvey(existingPIRId, {
          responden: 'Tim Observasi TI PUSRI',
          kepuasan: kepuasanSurvey,
          kesesuaian_tujuan: kesesuaianSurvey,
          kendala: kendalaSurvey,
          saran: saranSurvey,
          custom_pertanyaan: [],
        });

        // 3. Simpan/sinkronkan keterangan berkas dokumentasi observasi
        if (dokKeterangan.trim()) {
          const obsFiles = dokumentasiList.filter((d) => d.kategori === 'observasi');
          if (obsFiles.length > 0) {
            await pirApi.updateDokumentasi(obsFiles[0].id, dokKeterangan.trim());
            const dokRes = await pirApi.getDokumentasi(existingPIRId);
            setDokumentasiList(dokRes || []);
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(`pir_draft_dok_keterangan_${existingPIRId}`, dokKeterangan.trim());
          }
        }

        // 4. Sinkronisasi draf laporan observasi ke Step 3 jika masih kosong
        if (!ringkasanLaporan) {
          setRingkasanLaporan(
            `Berdasarkan hasil observasi langsung dan uji operasional lapangan oleh Tim TI: Sistem beroperasi dengan skor keandalan ${kepuasanSurvey}/5.0 dan kesesuaian fungsionalitas dengan sasaran awal mencapai ${(
              (kesesuaianSurvey / 5) *
              100
            ).toFixed(0)}%. ${catatanKondisi ? `Kondisi operasional lapangan: ${catatanKondisi}. ` : ''}${
              kendalaSurvey ? `Catatan kendala teknis: ${kendalaSurvey}.` : ''
            }`
          );
        }
        if (!rekomendasiLaporan && saranSurvey) {
          setRekomendasiLaporan(saranSurvey);
        }
      } else if (metode === 'wawancara') {
        // 1. Update pir_form dengan data narasumber dan kesimpulan wawancara
        await pirApi.update(existingPIRId, {
          vendor,
          tujuan_awal: tujuanAwal,
          metode: 'wawancara',
          nama_narasumber: namaNarasumber,
          jabatan_narasumber: jabatanNarasumber,
          kesimpulan_wawancara: kesimpulanWawancara,
          status: 'submitted',
        });

        // 2. Simpan skor penilaian wawancara
        const respLabel = namaNarasumber
          ? `${namaNarasumber}${jabatanNarasumber ? ` (${jabatanNarasumber})` : ''}`
          : 'Narasumber Wawancara';
        await pirApi.submitSurvey(existingPIRId, {
          responden: respLabel,
          kepuasan: kepuasanSurvey,
          kesesuaian_tujuan: kesesuaianSurvey,
          kendala: kendalaSurvey,
          saran: saranSurvey,
          custom_pertanyaan: [],
        });

        // 3. Simpan/sinkronkan keterangan berkas dokumentasi wawancara
        if (dokKeterangan.trim()) {
          const wawFiles = dokumentasiList.filter((d) => d.kategori === 'wawancara');
          if (wawFiles.length > 0) {
            await pirApi.updateDokumentasi(wawFiles[0].id, dokKeterangan.trim());
            const dokRes = await pirApi.getDokumentasi(existingPIRId);
            setDokumentasiList(dokRes || []);
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(`pir_draft_dok_keterangan_${existingPIRId}`, dokKeterangan.trim());
          }
        }

        // 4. Sinkronisasi draf laporan wawancara ke Step 3 jika masih kosong
        if (!ringkasanLaporan) {
          setRingkasanLaporan(
            `Berdasarkan sesi wawancara terarah dengan ${respLabel}: Tingkat kepuasan terhadap sistem mencapai skor ${kepuasanSurvey}/5.0 dan pemenuhan kebutuhan unit kerja mencapai ${(
              (kesesuaianSurvey / 5) *
              100
            ).toFixed(0)}%. ${kesimpulanWawancara ? `Rangkuman masukan narasumber: ${kesimpulanWawancara}. ` : ''}${
              kendalaSurvey ? `Kendala yang disampaikan: ${kendalaSurvey}.` : ''
            }`
          );
        }
        if (!rekomendasiLaporan && saranSurvey) {
          setRekomendasiLaporan(saranSurvey);
        }
      } else {
        // Metode Survey:
        // 1. Simpan desain pertanyaan lengkap (25 butir standar Google Form + kustom)
        const stdQ = PIR_STANDARD_QUESTIONS_SCOPE.map((q) => ({
          pertanyaan: q.judul,
          tipe: q.tipe,
          urutan: q.no,
          kategori: q.kategori,
        }));

        const allQ = [
          ...stdQ,
          ...customQuestions.map((cq, idx) => ({
            id: cq.id,
            pertanyaan: cq.pertanyaan,
            tipe: cq.tipe,
            urutan: 26 + idx,
            kategori: 'Pertanyaan Khusus Proyek',
          })),
        ];
        await pirApi.saveQuestions(existingPIRId, { pertanyaan: allQ });

        // 2. Jika PIC secara sengaja mengisi form manual atau jika belum ada responden sama sekali
        if (showManualInput || totalResponden === 0) {
          await pirApi.submitSurvey(existingPIRId, {
            responden: surveyRespondenName || responden || 'Kuesioner Pengguna',
            kepuasan: kepuasanSurvey,
            kesesuaian_tujuan: kesesuaianSurvey,
            kendala: kendalaSurvey,
            saran: saranSurvey,
            custom_pertanyaan: customQuestions,
          });
        }

        // 3. Sinkronisasi otomatis ke Step 3 (Laporan)
        if (!ringkasanLaporan) {
          const finalScore = totalResponden > 0 ? (kepuasanAvg || kepuasanSurvey) : kepuasanSurvey;
          const respCount = totalResponden > 0 ? totalResponden : (daftarResponden.length || 0);
          const respText = respCount > 0 ? ` melibatkan evaluasi dari ${respCount} responden pengguna` : '';
          const ringkasanKendala = summarizeFeedback(kendalaSurvey).replace(/\n/g, '; ');
          setRingkasanLaporan(
            `Berdasarkan hasil kuesioner evaluasi sistem${respText}: Rata-rata tingkat kepuasan pengguna mencapai skor ${Number(finalScore).toFixed(1)}/5.0 dan kesesuaian implementasi dengan sasaran awal mencapai ${(
              (kesesuaianSurvey / 5) *
              100
            ).toFixed(0)}%. ${ringkasanKendala ? `Rangkuman kendala yang dihimpun: ${ringkasanKendala}.` : 'Seluruh modul berjalan dengan baik tanpa kendala signifikan.'}`
          );
        }
        if (!rekomendasiLaporan && saranSurvey) {
          const cleanSaran = summarizeFeedback(saranSurvey).replace(/\n/g, '; ');
          setRekomendasiLaporan(
            cleanSaran || 'Melaksanakan monitoring berkala dan optimalisasi sistem secara berkelanjutan bersama unit kerja terkait.'
          );
        }
      }

      // Sinkronisasi otomatis temuan utama evaluasi ke Step 3 jika temuanList masih kosong
      if (temuanList.length === 0) {
        const generatedTemuan: string[] = [];
        if (kendalaSurvey && kendalaSurvey.trim()) {
          const summarizedLines = summarizeFeedback(kendalaSurvey)
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          generatedTemuan.push(...summarizedLines);
        }

        if (generatedTemuan.length === 0) {
          if (metode === 'observasi') {
            generatedTemuan.push(
              catatanKondisi
                ? `Hasil observasi kondisi lapangan: ${catatanKondisi}`
                : 'Infrastruktur dan performa modul operasional berjalan stabil tanpa kendala kritis.'
            );
          } else if (metode === 'wawancara') {
            generatedTemuan.push(
              kesimpulanWawancara
                ? `Rangkuman sesi wawancara: ${kesimpulanWawancara}`
                : 'Unit kerja menyambut baik implementasi sistem dan alur kerja baru telah diadopsi.'
            );
          } else {
            const respCount = totalResponden > 0 ? totalResponden : (daftarResponden.length || 0);
            generatedTemuan.push(
              respCount > 0
                ? `Evaluasi dari ${respCount} responden menunjukkan fungsionalitas dan kinerja sistem beroperasi stabil sesuai target.`
                : 'Tingkat adopsi user telah mencapai target operasional awal sesuai hasil evaluasi kuesioner.'
            );
          }
        }
        setTemuanList(generatedTemuan);
      }

      setMessage({
        type: 'success',
        text: proceed
          ? 'Hasil evaluasi disimpan! Melanjutkan ke Step 3 (Laporan PIR)...'
          : 'Data evaluasi (kendala teknis, rekomendasi, berkas bukti) berhasil disimpan sebagai draft.',
      });

      if (proceed) {
        setTimeout(() => {
          setCurrentStep(3);
          setMessage(null);
        }, 500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memproses evaluasi' });
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

      // Simpan pembaruan pejabat pengesahan ke form PIR
      await pirApi.update(existingPIRId, {
        disiapkan_oleh: disiapkanOleh,
        disiapkan_jabatan: disiapkanJabatan,
        direview_oleh: direviewOleh,
        direview_jabatan: direviewJabatan,
        disetujui_oleh: disetujuiOleh,
        disetujui_jabatan: disetujuiJabatan,
      });

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
                {currentStep === 2 &&
                  (metode === 'observasi'
                    ? 'Lembar Evaluasi Observasi Lapangan'
                    : metode === 'wawancara'
                    ? 'Lembar Kerja Wawancara Terarah'
                    : 'Pengelolaan Survei Kuesioner Pengguna')}
                {currentStep === 3 && 'Laporan Resmi Post Implementation Review'}
                {currentStep === 4 && 'Tindak Lanjut Temuan & Upload Bukti'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                {currentStep === 1 &&
                  'Lengkapi identitas proyek, lingkup tujuan awal, dan tentukan metode evaluasi PIR yang akan digunakan.'}
                {currentStep === 2 &&
                  (metode === 'observasi'
                    ? 'Catat kondisi teknis operasional, keandalan fungsional, dan penilaian pengamatan lapangan oleh Tim TI.'
                    : metode === 'wawancara'
                    ? 'Catat hasil tanya jawab, tanggapan narasumber unit kerja, dan skor penilaian wawancara.'
                    : 'Rancang butir pertanyaan, bagikan link publik, dan pantau rekapitulasi respon dari pengguna sistem.')}
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
                    onClick={() => {
                      const nextMode = !isNewProject;
                      setIsNewProject(nextMode);
                      resetFormState();
                      setCurrentStep(1);
                      if (nextMode) {
                        setSelectedProyekId('');
                        setProyek(null);
                        setVendor('');
                      } else if (proyekList.length > 0) {
                        setSelectedProyekId(proyekList[0].id);
                      }
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    {isNewProject ? '← Pilih Proyek Ada' : '+ Proyek Baru'}
                  </button>
                )}
              </div>
              {!isNewProject && proyekList.length > 0 ? (
                <select
                  value={selectedProyekId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedProyekId(newId);
                    setCurrentStep(1);
                    resetFormState();
                  }}
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
                        Tanggal Rilis <span className="text-rose-500">*</span>
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
                      <span className="block text-xs font-semibold text-gray-500">Tanggal Rilis</span>
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

              {/* 4. Pejabat Pengesahan Dokumen PIR (Berita Acara) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    Pejabat Pengesahan Dokumen PIR (Berita Acara)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Data pejabat penyiap, pereview, dan penyetujui yang tercetak pada lembar Berita Acara PIR resmi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Disiapkan oleh */}
                  <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Disiapkan Oleh
                      </label>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nama Pejabat
                      </label>
                      <input
                        type="text"
                        value={disiapkanOleh}
                        onChange={(e) => setDisiapkanOleh(e.target.value)}
                        placeholder="Contoh: Budi Pratama"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Jabatan / Posisi
                      </label>
                      <input
                        type="text"
                        value={disiapkanJabatan}
                        onChange={(e) => setDisiapkanJabatan(e.target.value)}
                        placeholder="Contoh: TKNO Perencanaan & Tata Kelola TI"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Direview oleh */}
                  <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Direview Oleh
                      </label>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nama Pejabat
                      </label>
                      <input
                        type="text"
                        value={direviewOleh}
                        onChange={(e) => setDireviewOleh(e.target.value)}
                        placeholder="Contoh: Rahmat Hidayat"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Jabatan / Posisi
                      </label>
                      <input
                        type="text"
                        value={direviewJabatan}
                        onChange={(e) => setDireviewJabatan(e.target.value)}
                        placeholder="Contoh: Senior Engineer Perencanaan & Tata Kelola TI"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Disetujui oleh */}
                  <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Disetujui Oleh
                      </label>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nama Pejabat
                      </label>
                      <input
                        type="text"
                        value={disetujuiOleh}
                        onChange={(e) => setDisetujuiOleh(e.target.value)}
                        placeholder="Contoh: Ahmad Fauzi"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Jabatan / Posisi
                      </label>
                      <input
                        type="text"
                        value={disetujuiJabatan}
                        onChange={(e) => setDisetujuiJabatan(e.target.value)}
                        placeholder="Contoh: VP Departemen Teknologi Informasi PSP"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
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
                  Lanjut ke Step 2 (
                    {metode === 'observasi'
                      ? 'Lembar Observasi'
                      : metode === 'wawancara'
                      ? 'Lembar Wawancara'
                      : 'Kelola Survei'}
                  )
                </Button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: EVALUASI & REVIEW BERDASARKAN METODE PIR */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in">
              {/* =================================================== */}
              {/* METODE 1: OBSERVASI LANGSUNG (INTERNAL TIM TI) */}
              {/* =================================================== */}
              {metode === 'observasi' && (
                <div className="space-y-6">
                  {/* Header Observasi */}
                  <div className="bg-linear-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                        <Eye size={13} /> Metode: Observasi Lapangan Langsung
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Lembar Evaluasi Observasi Operasional (Oleh Tim Penilai TI)
                    </h3>
                    <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                      Evaluasi teknis langsung di lokasi kerja pengguna untuk menguji keandalan sistem, responsivitas aplikasi, stabilitas jaringan, dan kemudahan antarmuka tanpa perlu menyebarkan survei publik ke pihak luar.
                    </p>
                  </div>

                  {/* Card 1: Checklist & Catatan Lapangan */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <ClipboardList size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Catatan Temuan Kondisi Lapangan & Infrastruktur</h4>
                        <p className="text-xs text-gray-500">Uraikan observasi saat sistem digunakan langsung oleh staf/operator unit kerja.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Uraian Kondisi Operasional di Lapangan <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={catatanKondisi}
                        onChange={(e) => setCatatanKondisi(e.target.value)}
                        placeholder="Contoh: Aplikasi diakses lancar di 10 workstation unit pemohon. Response time pencarian data rata-rata < 1.5 detik. Tampilan dashboard jelas dan responsif..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* 4 Aspek Teknis Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { label: 'Fungsionalitas Modul', desc: 'Seluruh menu utama bekerja sesuai spesifikasi kebutuhan bisnis.' },
                        { label: 'Performa & Waktu Tanggap', desc: 'Tidak ditemukan lagging atau freezing saat beban transaksi normal.' },
                        { label: 'Ketersediaan & Aksesibilitas', desc: 'Koneksi database stabil dan tidak terjadi downtime selama uji coba.' },
                        { label: 'Keamanan & Autentikasi', desc: 'Hak akses pengguna terisolasi sesuai unit kerja masing-masing.' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.label}</p>
                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Skor Penilaian Teknis Observasi */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Star size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Penilaian Hasil Observasi (Skor Metrik TI)</h4>
                        <p className="text-xs text-gray-500">Skor ini akan diolah otomatis menjadi metrik evaluasi pada Laporan Resmi Step 3.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Skor Keandalan Sistem di Lapangan (1 - 5 Bintang)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setKepuasanSurvey(val)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                kepuasanSurvey === val
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {val} ★
                            </button>
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-1.5">
                          {kepuasanSurvey === 5 && 'Sangat Baik — Sistem prima tanpa kendala operasional.'}
                          {kepuasanSurvey === 4 && 'Baik — Beroperasi stabil sesuai kebutuhan operasional.'}
                          {kepuasanSurvey === 3 && 'Cukup — Beroperasi dengan catatan minor.'}
                          {kepuasanSurvey <= 2 && 'Kurang — Memerlukan penyesuaian signifikan.'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Kesesuaian dengan Sasaran Awal Proyek
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setKesesuaianSurvey(val)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                kesesuaianSurvey === val
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {val * 20}%
                            </button>
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-1.5">
                          Persentase tercapainya target ruang lingkup awal sistem.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Temuan Kendala / Isu Teknis Lapangan
                        </label>
                        <textarea
                          rows={3}
                          value={kendalaSurvey}
                          onChange={(e) => setKendalaSurvey(e.target.value)}
                          placeholder="Tuliskan kendala teknis atau bug yang ditemukan selama observasi (opsional jika tidak ada)..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Rekomendasi Teknis Lanjutan
                        </label>
                        <textarea
                          rows={3}
                          value={saranSurvey}
                          onChange={(e) => setSaranSurvey(e.target.value)}
                          placeholder="Tuliskan usulan pemeliharaan, optimalisasi database, atau saran teknis ke depan..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Bukti & Dokumentasi Observasi Lapangan */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                          <Paperclip size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Dokumentasi & Bukti Observasi Lapangan
                          </h4>
                          <p className="text-xs text-gray-500">
                            Unggah foto inspeksi fisik, screenshot monitoring server, berkas log pengujian, atau dokumen pendukung (PDF, JPG, PNG, ZIP, maks 15MB).
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs w-fit">
                        {dokumentasiList.filter((d) => d.kategori === 'observasi').length} Berkas Terunggah
                      </Badge>
                    </div>

                    {/* Form Upload Bukti Observasi */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Keterangan Berkas / Deskripsi Bukti (Opsional)
                          </label>
                          <input
                            type="text"
                            value={dokKeterangan}
                            onChange={(e) => setDokKeterangan(e.target.value)}
                            placeholder="Contoh: Screenshot utilisasi CPU 60 hari, Foto rack server NOC, Log load testing..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Pilih File Dokumentasi
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              id="upload-obs-file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  handleUploadDokumentasi(f, 'observasi');
                                  e.target.value = '';
                                }
                              }}
                            />
                            <label
                              htmlFor="upload-obs-file"
                              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs transition ${
                                uploadingDokumentasi ? 'opacity-50 pointer-events-none' : ''
                              }`}
                            >
                              {uploadingDokumentasi ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Mengunggah...
                                </>
                              ) : (
                                <>
                                  <Upload size={14} /> Unggah File
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* List Berkas Dokumentasi Observasi */}
                    {dokumentasiList.filter((d) => d.kategori === 'observasi').length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-bold text-gray-700 mb-2">Daftar Berkas Terlampir:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dokumentasiList
                            .filter((d) => d.kategori === 'observasi')
                            .map((dok) => (
                              <div
                                key={dok.id}
                                className="flex flex-col p-3 rounded-xl border border-gray-200 bg-white hover:bg-slate-50/80 transition gap-2 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                      <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <a
                                        href={dok.url.startsWith('http') ? dok.url : `http://localhost:8080${dok.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-gray-900 hover:text-emerald-700 truncate block underline underline-offset-2"
                                        title={dok.nama_file}
                                      >
                                        {dok.nama_file}
                                      </a>
                                      <div className="text-[10px] text-gray-500">
                                        {(dok.ukuran_bytes / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDokId(dok.id);
                                        setEditingDokText(dok.keterangan || '');
                                      }}
                                      className="text-gray-400 hover:text-emerald-600 p-1.5 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                                      title="Edit keterangan"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDokumentasi(dok.id)}
                                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                      title="Hapus berkas"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                                {editingDokId === dok.id ? (
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                      type="text"
                                      value={editingDokText}
                                      onChange={(e) => setEditingDokText(e.target.value)}
                                      placeholder="Deskripsi berkas..."
                                      className="text-xs px-2 py-1 rounded border border-emerald-300 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateDokKeterangan(dok.id, editingDokText)}
                                      className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 shrink-0 cursor-pointer"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingDokId(null)}
                                      className="px-2 py-1 rounded text-gray-500 hover:text-gray-700 text-xs shrink-0 cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-gray-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between">
                                    <span className="truncate italic">
                                      {dok.keterangan ? `"${dok.keterangan}"` : 'Belum ada keterangan / deskripsi'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-2">
                        Belum ada berkas dokumentasi observasi yang diunggah.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* METODE 2: WAWANCARA TERARAH (BERSAMA NARASUMBER) */}
              {/* =================================================== */}
              {metode === 'wawancara' && (
                <div className="space-y-6">
                  {/* Header Wawancara */}
                  <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                        <MessageSquare size={13} /> Metode: Wawancara Terarah
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Lembar Kerja Wawancara Terarah (Bersama Narasumber Unit Kerja)
                    </h3>
                    <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                      PIC TI melakukan sesi wawancara langsung dengan narasumber pengguna kunci dan mencatat notulensi evaluasi serta penilaian narasumber ke lembar kerja ini.
                    </p>
                  </div>

                  {/* Card 1: Identitas Narasumber */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Data Narasumber / Pengguna Kunci</h4>
                        <p className="text-xs text-gray-500">Informasi pejabat atau staf unit kerja yang diwawancarai.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nama Narasumber <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={namaNarasumber}
                          onChange={(e) => setNamaNarasumber(e.target.value)}
                          placeholder="Nama Lengkap Narasumber"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Jabatan & Unit Kerja <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={jabatanNarasumber}
                          onChange={(e) => setJabatanNarasumber(e.target.value)}
                          placeholder="Contoh: Manager Pengadaan Barang / VP Logistik"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ringkasan & Transkrip Wawancara */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Rangkuman Hasil Tanya Jawab Wawancara</h4>
                        <p className="text-xs text-gray-500">Notulensi pokok bahasan wawancara terarah bersama narasumber.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Kesimpulan & Poin-Poin Masukan Narasumber <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={kesimpulanWawancara}
                        onChange={(e) => setKesimpulanWawancara(e.target.value)}
                        placeholder="Ringkasan poin wawancara: respon narasumber terhadap kemudahan fitur, efisiensi waktu kerja, dan aspek yang paling dirasakan manfaatnya..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Card 3: Penilaian Stakeholder dari Hasil Wawancara */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <Star size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Penilaian yang Diberikan Narasumber</h4>
                        <p className="text-xs text-gray-500">Skor rating yang disepakati bersama narasumber pada sesi wawancara.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Skor Kepuasan Narasumber (1 - 5 Bintang)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setKepuasanSurvey(val)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                kepuasanSurvey === val
                                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {val} ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Tingkat Kesesuaian Kebutuhan Unit
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setKesesuaianSurvey(val)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                kesesuaianSurvey === val
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {val * 20}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Kendala / Hambatan yang Disampaikan
                        </label>
                        <textarea
                          rows={3}
                          value={kendalaSurvey}
                          onChange={(e) => setKendalaSurvey(e.target.value)}
                          placeholder="Catatan hambatan operasional yang disampaikan narasumber..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Harapan & Usulan Perbaikan dari Narasumber
                        </label>
                        <textarea
                          rows={3}
                          value={saranSurvey}
                          onChange={(e) => setSaranSurvey(e.target.value)}
                          placeholder="Usulan pengembangan modul lanjutan atau pelatihan yang diminta narasumber..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Bukti & Dokumentasi Sesi Wawancara */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Paperclip size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Dokumentasi & Bukti Sesi Wawancara
                          </h4>
                          <p className="text-xs text-gray-500">
                            Unggah foto kegiatan sesi wawancara, scan lembar notulensi bertanda tangan/paraf narasumber, atau dokumen hasil tanya jawab (PDF, JPG, PNG, ZIP, maks 15MB).
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs w-fit">
                        {dokumentasiList.filter((d) => d.kategori === 'wawancara').length} Berkas Terunggah
                      </Badge>
                    </div>

                    {/* Form Upload Bukti Wawancara */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Keterangan Berkas / Deskripsi Bukti (Opsional)
                          </label>
                          <input
                            type="text"
                            value={dokKeterangan}
                            onChange={(e) => setDokKeterangan(e.target.value)}
                            placeholder="Contoh: Foto sesi wawancara bersama Superintendent, Scan notulensi bertanda tangan..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Pilih File Dokumentasi
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              id="upload-waw-file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  handleUploadDokumentasi(f, 'wawancara');
                                  e.target.value = '';
                                }
                              }}
                            />
                            <label
                              htmlFor="upload-waw-file"
                              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs transition ${
                                uploadingDokumentasi ? 'opacity-50 pointer-events-none' : ''
                              }`}
                            >
                              {uploadingDokumentasi ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Mengunggah...
                                </>
                              ) : (
                                <>
                                  <Upload size={14} /> Unggah File
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* List Berkas Dokumentasi Wawancara */}
                    {dokumentasiList.filter((d) => d.kategori === 'wawancara').length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-bold text-gray-700 mb-2">Daftar Berkas Terlampir:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dokumentasiList
                            .filter((d) => d.kategori === 'wawancara')
                            .map((dok) => (
                              <div
                                key={dok.id}
                                className="flex flex-col p-3 rounded-xl border border-gray-200 bg-white hover:bg-slate-50/80 transition gap-2 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                      <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <a
                                        href={dok.url.startsWith('http') ? dok.url : `http://localhost:8080${dok.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-gray-900 hover:text-blue-700 truncate block underline underline-offset-2"
                                        title={dok.nama_file}
                                      >
                                        {dok.nama_file}
                                      </a>
                                      <div className="text-[10px] text-gray-500">
                                        {(dok.ukuran_bytes / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDokId(dok.id);
                                        setEditingDokText(dok.keterangan || '');
                                      }}
                                      className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition cursor-pointer"
                                      title="Edit keterangan"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDokumentasi(dok.id)}
                                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition cursor-pointer"
                                      title="Hapus berkas"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                                {editingDokId === dok.id ? (
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                      type="text"
                                      value={editingDokText}
                                      onChange={(e) => setEditingDokText(e.target.value)}
                                      placeholder="Deskripsi berkas..."
                                      className="text-xs px-2 py-1 rounded border border-blue-300 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateDokKeterangan(dok.id, editingDokText)}
                                      className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 shrink-0 cursor-pointer"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingDokId(null)}
                                      className="px-2 py-1 rounded text-gray-500 hover:text-gray-700 text-xs shrink-0 cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-gray-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between">
                                    <span className="truncate italic">
                                      {dok.keterangan ? `"${dok.keterangan}"` : 'Belum ada keterangan / deskripsi'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-2">
                        Belum ada berkas dokumentasi wawancara yang diunggah.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* METODE 3: SURVEI KUESIONER MULTI-RESPONDEN */}
              {/* =================================================== */}
              {metode === 'survey' && (
                <div className="space-y-6">
                  {/* Header Survey */}
                  <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-teal-800 p-6 rounded-2xl text-white shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
                        <FileSpreadsheet size={13} /> Metode: Kuesioner Survei Multi-Responden
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Pengelolaan Survei Kuesioner Pengguna
                    </h3>
                    <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                      PIC merancang butir kuesioner dan membagikan tautan publik kepada para pengguna sistem. Setiap respon masuk otomatis dikompilasi dan dirata-ratakan tanpa risiko saling menimpa data.
                    </p>
                  </div>

                  {/* Card 1: Shareable Link & Status Respon Realtime */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Share2 size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Tautan Kuesioner Publik (Shareable Link)</h4>
                          <p className="text-xs text-gray-500">
                            Responden pengguna akhir dapat langsung mengisi review tanpa perlu akun login sistem TI.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {totalResponden > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            {totalResponden} Respon Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock size={14} className="text-amber-600" />
                            Menunggu Respon User
                          </span>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={refreshSurveyStatus}
                          disabled={refreshingSurvey}
                          className="rounded-xl text-xs font-semibold h-8 cursor-pointer"
                        >
                          <RefreshCw size={13} className={`mr-1.5 ${refreshingSurvey ? 'animate-spin' : ''}`} />
                          Cek Respon Terbaru
                        </Button>
                      </div>
                    </div>

                    {/* Box Tautan */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 w-full bg-white px-3.5 py-2 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 truncate select-all">
                        {typeof window !== 'undefined'
                          ? `${window.location.origin}/survey/${existingPIRId}`
                          : `/survey/${existingPIRId}`}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          type="button"
                          onClick={copySurveyLink}
                          className="flex-1 sm:flex-none rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          {linkCopied ? (
                            <>
                              <Check size={14} className="mr-1.5 text-emerald-200" />
                              Tautan Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy size={14} className="mr-1.5" />
                              Salin Link
                            </>
                          )}
                        </Button>
                        <a
                          href={`/survey/${existingPIRId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition"
                        >
                          <ExternalLink size={14} className="mr-1.5" />
                          Buka Form
                        </a>
                      </div>
                    </div>

                    {/* Aggregate Metric Card jika sudah ada respon */}
                    {totalResponden > 0 ? (
                      <div className="space-y-4">
                        {/* 3 Kartu Metrik Utama yang Simetris & Seimbang */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div className="bg-linear-to-br from-emerald-50 to-teal-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                              <span className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Total Responden</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-black text-emerald-700 tracking-tight">{totalResponden}</span>
                                <span className="text-xs font-semibold text-emerald-600">Orang</span>
                              </div>
                              <span className="text-[11px] text-emerald-600/90 font-medium">Partisipan aktif mengisi</span>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                              <Users size={22} />
                            </div>
                          </div>

                          <div className="bg-linear-to-br from-amber-50/70 to-yellow-50/40 p-4 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                              <span className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">Rata-Rata Kepuasan</span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-black text-amber-700 tracking-tight">{kepuasanAvg || 5}</span>
                                <span className="text-xs font-bold text-amber-600">/ 5.0</span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={
                                      star <= Math.round(kepuasanAvg || 5)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-amber-200'
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                              <Star size={22} className="fill-amber-500 text-amber-500" />
                            </div>
                          </div>

                          <div className="bg-linear-to-br from-teal-50 to-cyan-50/50 p-4 rounded-xl border border-teal-200/80 shadow-2xs flex items-center justify-between">
                            <div>
                              <span className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider">Kesesuaian Target</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-teal-700 tracking-tight">{((kesesuaianSurvey / 5) * 100).toFixed(0)}%</span>
                              </div>
                              <span className="text-[11px] text-teal-600/90 font-medium">Pencapaian sasaran sistem</span>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={22} />
                            </div>
                          </div>
                        </div>

                        {/* Panel Kompilasi Masukan & Catatan Responden Terstruktur */}
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                <MessageSquare size={14} />
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Rangkuman Umpan Balik Responden
                              </h5>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {daftarResponden.length} responden tercatat
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Sub-Card 1: Kendala Operasional */}
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200/90 space-y-1.5 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-amber-800">
                                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Kendala Teknis / Operasional</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-line font-medium">
                                {kendalaSurvey || 'Tidak ada kendala operasional yang dilaporkan oleh responden.'}
                              </p>
                            </div>

                            {/* Sub-Card 2: Saran & Usulan Peningkatan */}
                            <div className="bg-white p-3.5 rounded-xl border border-blue-200/90 space-y-1.5 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-blue-800">
                                <Sparkles size={14} className="text-blue-600 shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Saran & Rekomendasi Fitur</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-line font-medium">
                                {saranSurvey || 'Seluruh responden menyatakan sistem telah beroperasi secara optimal.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tabel Daftar Responden yang Masuk */}
                        {daftarResponden.length > 0 && (
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="py-2.5 px-3">No</th>
                                  <th className="py-2.5 px-3">Nama Responden</th>
                                  <th className="py-2.5 px-3">No. Badge</th>
                                  <th className="py-2.5 px-3">Jabatan & Unit Kerja</th>
                                  <th className="py-2.5 px-3 text-center">Kepuasan</th>
                                  <th className="py-2.5 px-3">Kendala & Saran</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {daftarResponden.map((resp, idx) => (
                                  <tr key={resp.id || idx} className="hover:bg-gray-50/70">
                                    <td className="py-2 px-3 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="py-2 px-3 font-bold text-gray-900">{resp.nama}</td>
                                    <td className="py-2 px-3 font-mono font-semibold text-blue-700">{resp.no_badge || '-'}</td>
                                    <td className="py-2 px-3 text-gray-600">
                                      {resp.jabatan ? `${resp.jabatan} (${resp.unit_kerja || '-'})` : (resp.unit_kerja || '-')}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                        <Star size={11} className="fill-amber-400 text-amber-400" />
                                        {resp.kepuasan} / 5
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-gray-600 max-w-xs truncate">
                                      {resp.saran || resp.kendala || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                        <Share2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Tautan kuesioner siap dibagikan!</p>
                          <p className="mt-0.5 text-blue-800 leading-relaxed">
                            Salin tautan di atas dan bagikan kepada stakeholder/user proyek. Setiap respon yang masuk akan langsung muncul di halaman ini secara otomatis tanpa menimpa data yang sedang Anda kelola.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Opsi Form Input Manual jika ada kuesioner kertas / offline */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowManualInput(!showManualInput)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showManualInput ? '▼ Sembunyikan Input Responden Manual' : '▶ Butuh Input Responden Manual (Kuesioner Kertas/Offline)?'}</span>
                      </button>

                      {showManualInput && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4 animate-in fade-in">
                          <span className="text-xs font-bold text-gray-800 block">Form Input Kuesioner Manual (PIC TI):</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Skor Kepuasan (1 - 5)</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setKepuasanSurvey(val)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                      kepuasanSurvey === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'
                                    }`}
                                  >
                                    {val} ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Kesesuaian Target</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setKesesuaianSurvey(val)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                      kesesuaianSurvey === val ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700'
                                    }`}
                                  >
                                    {val * 20}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Kendala yang Dilaporkan</label>
                              <textarea
                                rows={2}
                                value={kendalaSurvey}
                                onChange={(e) => setKendalaSurvey(e.target.value)}
                                placeholder="Kendala dari formulir kertas..."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Saran / Masukan</label>
                              <textarea
                                rows={2}
                                value={saranSurvey}
                                onChange={(e) => setSaranSurvey(e.target.value)}
                                placeholder="Saran dari formulir kertas..."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Desain Pertanyaan Kuesioner */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <FileSpreadsheet size={18} className="text-blue-600" />
                          Desain Butir Pertanyaan Kuesioner (Tampil di Tautan Publik)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Standar Post Implementation Review PT PUSRI (25 Butir mencakup Kualitas Sistem, Kualitas Data, Layanan TI, Kepuasan Pengguna, Dampak Kinerja, Manfaat Operasional %, dan Masukan Kualitatif).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllStandardQuestions(!showAllStandardQuestions)}
                          className="text-xs font-semibold text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl cursor-pointer"
                        >
                          {showAllStandardQuestions ? 'Ciutkan Daftar' : `Lihat Semua (25 Butir)`}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCustomQuestions((prev) => [
                              ...prev,
                              { pertanyaan: '', tipe: 'teks', jawaban_teks: '' },
                            ])
                          }
                          className="text-xs font-bold text-blue-700 border-blue-300 hover:bg-blue-50 rounded-xl cursor-pointer"
                        >
                          <Plus size={14} className="mr-1.5" />
                          Tambah Pertanyaan Kustom
                        </Button>
                      </div>
                    </div>

                    {/* 25 Pertanyaan Standar */}
                    <div className="space-y-2.5">
                      {(showAllStandardQuestions
                        ? PIR_STANDARD_QUESTIONS_SCOPE
                        : PIR_STANDARD_QUESTIONS_SCOPE.slice(0, 5)
                      ).map((q) => (
                        <div key={q.no} className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              {q.no}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 leading-snug">{q.judul}</p>
                              <p className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                                <span className="text-emerald-700 font-semibold">{q.kategori}</span>
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-semibold text-gray-600 bg-white shrink-0">
                            {q.tipe === 'skala' ? 'Skala 1 - 5' : q.tipe === 'pilihan' ? 'Pilihan %' : 'Teks Panjang'}
                          </Badge>
                        </div>
                      ))}

                      {!showAllStandardQuestions && (
                        <button
                          type="button"
                          onClick={() => setShowAllStandardQuestions(true)}
                          className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs text-blue-700 hover:text-blue-900 hover:border-blue-300 font-bold bg-blue-50/30 transition text-center cursor-pointer"
                        >
                          + Tampilkan 20 Butir Pertanyaan Standar Lainnya
                        </button>
                      )}
                    </div>

                    {/* Pertanyaan Kustom jika ada */}
                    {customQuestions.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Pertanyaan Kustom Tambahan ({customQuestions.length})
                        </h5>
                        {customQuestions.map((q, idx) => (
                          <div key={idx} className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold text-gray-700">Pertanyaan #{idx + 26}</span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={q.tipe}
                                  onChange={(e) => {
                                    const updated = [...customQuestions];
                                    updated[idx].tipe = e.target.value as any;
                                    setCustomQuestions(updated);
                                  }}
                                  className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg font-semibold"
                                >
                                  <option value="teks">Isian Teks</option>
                                  <option value="skala">Skala 1 - 5</option>
                                  <option value="pilihan">Pilihan Ya / Tidak</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== idx))}
                                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                >
                                  <Trash2 size={15} />
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
                              placeholder="Ketikkan teks pertanyaan tambahan..."
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        onClick={handleSaveQuestionsOnly}
                        className="rounded-xl text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
                      >
                        <Save size={14} className="mr-1.5" />
                        Simpan Desain Pertanyaan
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Step 2 */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-xl font-semibold text-xs sm:text-sm cursor-pointer"
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
                    className="rounded-xl font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <Save size={16} className="mr-2" />
                    Simpan Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveStep2(true)}
                    className="bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-semibold px-6 text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <ArrowRight size={16} className="mr-2" />
                    )}
                    Lanjut ke Step 3 (Laporan PIR)
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

                {/* Penyesuaian Pejabat Pengesahan Dokumen Berita Acara */}
                <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Pejabat Pengesahan Dokumen Berita Acara
                    </label>
                    <span className="text-[11px] text-gray-500">Dapat diedit langsung sebelum penerbitan</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-blue-700">Disiapkan Oleh:</span>
                      <input
                        type="text"
                        value={disiapkanOleh}
                        onChange={(e) => setDisiapkanOleh(e.target.value)}
                        placeholder="Nama Pejabat"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={disiapkanJabatan}
                        onChange={(e) => setDisiapkanJabatan(e.target.value)}
                        placeholder="Jabatan"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-700">Direview Oleh:</span>
                      <input
                        type="text"
                        value={direviewOleh}
                        onChange={(e) => setDireviewOleh(e.target.value)}
                        placeholder="Nama Pejabat"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={direviewJabatan}
                        onChange={(e) => setDireviewJabatan(e.target.value)}
                        placeholder="Jabatan"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-700">Disetujui Oleh:</span>
                      <input
                        type="text"
                        value={disetujuiOleh}
                        onChange={(e) => setDisetujuiOleh(e.target.value)}
                        placeholder="Nama Pejabat"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={disetujuiJabatan}
                        onChange={(e) => setDisetujuiJabatan(e.target.value)}
                        placeholder="Jabatan"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-600"
                      />
                    </div>
                  </div>
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

                {/* Kertas Dokumen Cetak Berita Acara PUSRI (Format Template Page 1) */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-300 shadow-md font-sans text-gray-900">
                  <div className="border-2 border-black divide-y-2 divide-black text-xs sm:text-sm">
                    {/* Header: Logo PUSRI (Kiri) & Judul Berita Acara (Kanan) */}
                    <div className="grid grid-cols-12 divide-x-2 divide-black">
                      <div className="col-span-4 p-3 flex items-center justify-center bg-white">
                        <img
                          src="/pusri_logo.png"
                          alt="Logo PUSRI"
                          className="max-h-14 object-contain"
                          onError={(e) => {
                            // Fallback jika image gagal load
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="col-span-8 p-3 flex flex-col items-center justify-center text-center">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                          Berita Acara
                        </h2>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          Post Implementation Review (PIR)
                        </h3>
                      </div>
                    </div>

                    {/* Metadata Row: Aplikasi */}
                    <div className="grid grid-cols-12 divide-x-2 divide-black">
                      <div className="col-span-3 sm:col-span-3 p-2.5 font-bold bg-gray-50/50 text-gray-900 flex items-center">
                        Aplikasi
                      </div>
                      <div className="col-span-9 sm:col-span-9 p-2.5 font-semibold text-gray-900 flex items-center">
                        {proyek?.nama_kegiatan || '-'}
                      </div>
                    </div>

                    {/* Metadata Row: Tanggal serah terima */}
                    <div className="grid grid-cols-12 divide-x-2 divide-black">
                      <div className="col-span-3 sm:col-span-3 p-2.5 font-bold bg-gray-50/50 text-gray-900 flex items-center">
                        Tanggal serah terima
                      </div>
                      <div className="col-span-9 sm:col-span-9 p-2.5 text-gray-800 flex items-center">
                        {formatTanggalIndo(proyek?.tanggal_go_live)}
                      </div>
                    </div>

                    {/* Metadata Row: Perihal */}
                    <div className="grid grid-cols-12 divide-x-2 divide-black">
                      <div className="col-span-3 sm:col-span-3 p-2.5 font-bold bg-gray-50/50 text-gray-900 flex items-center">
                        Perihal
                      </div>
                      <div className="col-span-9 sm:col-span-9 p-2.5 text-gray-800 flex items-center">
                        Progres dan Evaluasi Digitalisasi {proyek?.nama_kegiatan || '-'} ({nomorPIRPreview})
                      </div>
                    </div>

                    {/* Uraian Kegiatan (Bagian Inti) */}
                    <div className="grid grid-cols-12 divide-x-2 divide-black">
                      <div className="col-span-3 sm:col-span-3 p-2.5 font-bold bg-gray-50/50 text-gray-900">
                        Uraian Kegiatan
                      </div>
                      <div className="col-span-9 sm:col-span-9 p-3 sm:p-4 space-y-4 leading-relaxed text-gray-800 text-xs sm:text-[13px]">
                        <p>
                          Telah dilaksanakan kegiatan Post Implementation Review (PIR) sebagai bagian dari evaluasi pasca implementasi sistem. Kegiatan ini dilakukan untuk meninjau hasil pelaksanaan implementasi, memastikan kesesuaian sistem dengan kebutuhan dan proses bisnis yang telah ditetapkan, mengidentifikasi kendala atau permasalahan yang masih ditemukan, serta mengevaluasi efektivitas penggunaan sistem setelah implementasi.
                        </p>

                        {/* Hasil Evaluasi Khusus Berdasarkan Metode */}
                        <div className="p-3 rounded-lg border border-gray-300 bg-gray-50/80 space-y-2">
                          <div className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b border-gray-200 pb-1 flex items-center justify-between">
                            <span>Hasil Evaluasi PIR (Metode: {metode})</span>
                            <span className="text-[11px] font-semibold text-blue-800 capitalize bg-blue-100 px-2 py-0.5 rounded">
                              {metode}
                            </span>
                          </div>

                          {metode === 'observasi' ? (
                            <div className="space-y-2">
                              <p className="text-gray-700">
                                <strong>Ringkasan:</strong> {ringkasanLaporan || 'Pengujian langsung operasional sistem di lapangan oleh Tim TI menunjukkan sistem berjalan stabil.'}
                              </p>
                              {catatanKondisi && (
                                <p className="text-gray-700 italic">
                                  <strong>Kondisi Lapangan:</strong> "{catatanKondisi}"
                                </p>
                              )}
                              <div className="text-[11px] text-gray-600 bg-white p-2 rounded border border-gray-200">
                                <strong>Status 4 Aspek Evaluasi Tim TI:</strong> Fungsionalitas Modul (✓), Kinerja & Respon Sistem (✓), Ketersediaan High Availability (✓), Keamanan Hak Akses (✓).
                              </div>
                              <div className="flex items-center gap-4 pt-1 font-semibold text-xs">
                                <span className="text-blue-900">Skor Keandalan Operasional: {kepuasanSurvey.toFixed(1)} / 5.0</span>
                                <span className="text-emerald-900">Kesesuaian Spesifikasi Teknis: {((kesesuaianSurvey / 5) * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ) : metode === 'wawancara' ? (
                            <div className="space-y-2">
                              {(namaNarasumber || jabatanNarasumber) && (
                                <p className="text-gray-700">
                                  <strong>Narasumber:</strong> {namaNarasumber || '-'} {jabatanNarasumber ? `(${jabatanNarasumber})` : ''}
                                </p>
                              )}
                              <p className="text-gray-700">
                                <strong>Ringkasan:</strong> {ringkasanLaporan || 'Sesi wawancara terarah dilakukan bersama pemangku kepentingan untuk meninjau pemenuhan kebutuhan bisnis.'}
                              </p>
                              {kesimpulanWawancara && (
                                <p className="text-gray-700 italic">
                                  <strong>Rangkuman Masukan:</strong> "{kesimpulanWawancara}"
                                </p>
                              )}
                              <div className="flex items-center gap-4 pt-1 font-semibold text-xs">
                                <span className="text-blue-900">Skor Kepuasan Narasumber: {kepuasanSurvey.toFixed(1)} / 5.0</span>
                                <span className="text-emerald-900">Pemenuhan Kebutuhan Unit Kerja: {((kesesuaianSurvey / 5) * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-gray-700">
                                <strong>Sasaran Responden:</strong> {responden || 'Pengguna Sistem'} ({totalResponden} Responden Berpartisipasi)
                              </p>
                              <p className="text-gray-700">
                                <strong>Ringkasan:</strong> {ringkasanLaporan || 'Evaluasi kuesioner komprehensif mengukur tingkat kepuasan, adopsi, dan dampak implementasi sistem.'}
                              </p>
                              <div className="text-[11px] text-gray-600 bg-white p-2 rounded border border-gray-200">
                                <strong>Cakupan Dimensi Evaluasi:</strong> Kualitas Antarmuka & Sistem, Kualitas Data & Informasi, Layanan Helpdesk TI, Kepuasan & Adopsi Pengguna, Dampak Kinerja & Manfaat Implementasi.
                              </div>
                              <div className="flex items-center gap-4 pt-1 font-semibold text-xs">
                                <span className="text-blue-900">Rata-rata Skor Kepuasan (CSAT): {kepuasanSurvey.toFixed(1)} / 5.0</span>
                                <span className="text-emerald-900">Kesesuaian Harapan Pengguna: {((kesesuaianSurvey / 5) * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Temuan Utama */}
                        <div className="space-y-1">
                          <strong className="block text-gray-900 font-semibold">Temuan Utama Evaluasi:</strong>
                          {temuanList.length === 0 ? (
                            <p className="text-gray-500 italic">Tidak ada kendala kritis yang dilaporkan; sistem beroperasi dengan normal.</p>
                          ) : (
                            <ol className="list-decimal list-inside space-y-0.5 text-gray-700">
                              {temuanList.map((t, idx) => (
                                <li key={idx}>{cleanAnonymizedText(t)}</li>
                              ))}
                            </ol>
                          )}
                        </div>

                        {/* Rekomendasi Tindak Lanjut */}
                        <div className="space-y-1">
                          <strong className="block text-gray-900 font-semibold">Rekomendasi Tindak Lanjut:</strong>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {summarizeFeedback(rekomendasiLaporan) || 'Melaksanakan monitoring berkala dan menindaklanjuti seluruh temuan PIR bersama pihak terkait.'}
                          </p>
                        </div>

                        <p className="pt-1">
                          Hasil review selanjutnya menjadi dasar dalam menentukan rekomendasi dan tindak lanjut perbaikan yang diperlukan untuk mendukung optimalisasi penggunaan sistem.
                        </p>
                      </div>
                    </div>

                    {/* Baris Tanggal */}
                    <div className="p-2.5 font-bold text-gray-900 bg-white">
                      Palembang, {formatTanggalIndo(tanggalLaporan)}
                    </div>

                    {/* Baris Tanda Tangan: 3 Kolom Berita Acara PUSRI */}
                    <div className="grid grid-cols-3 divide-x-2 divide-black text-center">
                      {/* Kolom 1 */}
                      <div className="flex flex-col justify-between p-3 min-h-35">
                        <div className="font-bold text-gray-900">Disiapkan oleh</div>
                        <div className="space-y-0.5">
                          <div className="font-bold underline text-gray-900">
                            {disiapkanOleh || 'Budi Pratama'}
                          </div>
                          <div className="text-[11px] text-gray-600">
                            {disiapkanJabatan || 'TKNO Perencanaan & Tata Kelola TI'}
                          </div>
                        </div>
                      </div>

                      {/* Kolom 2 */}
                      <div className="flex flex-col justify-between p-3 min-h-35">
                        <div className="font-bold text-gray-900">Direview oleh</div>
                        <div className="space-y-0.5">
                          <div className="font-bold underline text-gray-900">
                            {direviewOleh || 'Rahmat Hidayat'}
                          </div>
                          <div className="text-[11px] text-gray-600">
                            {direviewJabatan || 'Senior Engineer Perencanaan & Tata Kelola TI'}
                          </div>
                        </div>
                      </div>

                      {/* Kolom 3 */}
                      <div className="flex flex-col justify-between p-3 min-h-35">
                        <div className="font-bold text-gray-900">Disetujui oleh</div>
                        <div className="space-y-0.5">
                          <div className="font-bold underline text-gray-900">
                            {disetujuiOleh || 'Ahmad Fauzi'}
                          </div>
                          <div className="text-[11px] text-gray-600">
                            {disetujuiJabatan || 'VP Departemen Teknologi Informasi PSP'}
                          </div>
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

      {/* Floating Toast Notification (Always visible regardless of scroll position) */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
              message.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/30'
                : 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === 'success' ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle size={18} />
                </div>
              )}
              <div className="text-xs sm:text-sm font-medium leading-relaxed pr-2">
                <span className="font-bold block text-[13px] mb-0.5">
                  {message.type === 'success' ? 'Berhasil Disimpan' : 'Pemberitahuan'}
                </span>
                {message.text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
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
