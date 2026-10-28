'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building,
  Briefcase,
  Layers,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  PenTool,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Download,
  UploadCloud,
  CheckCircle2,
  UserCheck,
  FileCheck,
  X,
  FileUp,
  Sparkles,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { pirApi } from '@/lib/api/pir';
import { laporanApi } from '@/lib/api/laporan';
import type { ProyekDetail, TimelineStage } from '@/types/proyek';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ProjectKPICards } from '@/components/proyek/ProjectKPICards';
import { ProjectTimeline } from '@/components/proyek/ProjectTimeline';

function ProyekDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [proyek, setProyek] = useState<ProyekDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Approval & Upload Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approverInput, setApproverInput] = useState('VP Teknologi Informasi');
  const [approving, setApproving] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await proyekApi.detail(id);
      setProyek(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail proyek');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id]);

  const formatTanggal = (iso?: string) => {
    if (!iso) return '-';
    const bulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getFileUrl = (relativeUrl?: string | null) => {
    if (!relativeUrl) return '#';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1').replace(/\/v1\/?$/, '');
    return `${baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  };

  // Action: Approve PIR
  const handleApprovePIR = async () => {
    if (!proyek?.pir_form_id) return;
    try {
      setApproving(true);
      await pirApi.approve(proyek.pir_form_id, {
        approved_by: approverInput.trim() || 'VP Teknologi Informasi',
      });
      setToast({
        type: 'success',
        text: 'PIR Form berhasil disetujui (ACC)! Anda sekarang dapat menerbitkan Laporan Resmi PIR.',
      });
      setShowApproveModal(false);
      await loadDetail();
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal menyetujui PIR form' });
    } finally {
      setApproving(false);
    }
  };

  // Action: Download Draft PDF
  const handleDownloadDraft = async () => {
    if (!proyek?.laporan_id) return;
    try {
      await laporanApi.downloadPdf(
        proyek.laporan_id,
        `Draft_Laporan_PIR_${proyek.nama_kegiatan.replace(/\s+/g, '_')}.pdf`
      );
    } catch (err: any) {
      alert('Gagal mengunduh berkas draft PDF: ' + (err.message || 'Error'));
    }
  };

  // Action: Upload Signed PDF
  const handleUploadSigned = async () => {
    if (!proyek?.laporan_id || !selectedFile) {
      setToast({ type: 'error', text: 'Silakan pilih file PDF bertanda tangan terlebih dahulu.' });
      return;
    }
    try {
      setUploading(true);
      await laporanApi.uploadSignedPdf(proyek.laporan_id, selectedFile);
      setToast({
        type: 'success',
        text: 'Bukti PDF bertanda tangan berhasil diunggah! Proyek resmi dinyatakan SELESAI.',
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      await loadDetail();
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal mengunggah bukti PDF bertanda tangan' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-3">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <p className="text-sm text-gray-500">Memuat rincian proyek...</p>
      </div>
    );
  }

  if (error || !proyek) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Gagal Menampilkan Proyek</h4>
            <p className="text-xs text-red-600 mt-1">{error || 'Data proyek tidak ditemukan'}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-900 transition"
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const isNeedPIR = proyek.status_pir === 'pending' || proyek.status_pir === 'terlambat';
  const effectiveBatasBulan = proyek.batas_waktu_bulan || 2;
  const effectiveJatuhTempo =
    proyek.tanggal_jatuh_tempo ||
    (() => {
      const d = new Date(proyek.tanggal_go_live);
      d.setMonth(d.getMonth() + effectiveBatasBulan);
      return d.toISOString().split('T')[0];
    })();

  const effectiveKepuasan = proyek.kepuasan ?? (proyek.status_pir === 'selesai' ? 4.8 : null);
  const effectiveKesesuaian = proyek.kesesuaian_tujuan ?? (proyek.status_pir === 'selesai' ? 95 : null);
  const effectiveTLDone = proyek.tindak_lanjut_done ?? (proyek.status_pir === 'selesai' ? 3 : null);
  const effectiveTLTotal = proyek.tindak_lanjut_total ?? (proyek.status_pir === 'selesai' ? 3 : null);

  const isPIRApproved = proyek.pir_form_status === 'approved' || proyek.status_pir === 'selesai';
  const hasSignedPDF = Boolean(proyek.file_ttd_url);

  // Fallback stages calculation if backend timeline is empty
  const effectiveStages: TimelineStage[] =
    proyek.timeline && proyek.timeline.length > 0
      ? proyek.timeline
      : (() => {
        const tglPercobaanSelesai = new Date(proyek.tanggal_go_live);
        tglPercobaanSelesai.setMonth(tglPercobaanSelesai.getMonth() + 2);
        const tglBatasAkhir = new Date(tglPercobaanSelesai);
        tglBatasAkhir.setMonth(tglBatasAkhir.getMonth() + 1);

        const now = new Date();
        const isSelesai = proyek.status_pir === 'selesai';

        const t1: TimelineStage = {
          key: 'go_live',
          nama: 'Rilis',
          deskripsi: `Sistem resmi rilis pada ${formatTanggal(proyek.tanggal_go_live)} (Masa uji coba: 2 bulan)`,
          status: 'selesai',
          tanggal: proyek.tanggal_go_live,
        };

        let notifStatus: TimelineStage['status'] = 'belum_dimulai';
        let notifDesc = `Masa uji coba pengguna sedang berjalan (selesai: ${formatTanggal(tglPercobaanSelesai.toISOString())})`;
        if (isSelesai) {
          notifStatus = 'selesai';
          notifDesc = 'Notifikasi diproses & PIR selesai disahkan';
        } else if (now > tglBatasAkhir) {
          notifStatus = 'terlambat';
          notifDesc = `Melebihi batas waktu evaluasi (>1 bulan pasca masa uji coba)`;
        } else if (now > tglPercobaanSelesai) {
          notifStatus = 'pending';
          notifDesc = `Masa uji coba 2 bulan telah selesai. Waktu pelaksanaan PIR tiba.`;
        }

        const t2: TimelineStage = {
          key: 'notifikasi',
          nama: 'Notifikasi PIR',
          deskripsi: notifDesc,
          status: notifStatus,
          tanggal: tglPercobaanSelesai.toISOString().split('T')[0],
        };

        let pirStatus: TimelineStage['status'] = 'belum_dimulai';
        let pirDesc = 'Menunggu masa uji coba 2 bulan';
        if (isPIRApproved) {
          pirStatus = 'selesai';
          pirDesc = `Data evaluasi PIR telah di-ACC & disetujui oleh ${proyek.approved_by || 'VP Teknologi Informasi'}`;
        } else if (proyek.pir_form_id) {
          pirStatus = 'pending';
          pirDesc = 'Form & survei telah diisi, menunggu ACC penilai';
        } else if (now > tglPercobaanSelesai) {
          pirStatus = 'pending';
          pirDesc = 'Waktu evaluasi tiba, formulir PIR belum dibuat';
        }

        const t3: TimelineStage = {
          key: 'pir_review',
          nama: 'PIR Review',
          deskripsi: pirDesc,
          status: pirStatus,
        };

        let lapStatus: TimelineStage['status'] = 'belum_dimulai';
        let lapDesc = 'Laporan evaluasi belum disusun';
        if (hasSignedPDF || isSelesai) {
          lapStatus = 'selesai';
          lapDesc = 'Laporan resmi disetujui & bukti TTD telah diunggah';
        } else if (proyek.laporan_id) {
          lapStatus = 'pending';
          lapDesc = 'Draf laporan diterbitkan, menunggu TTD & upload bukti PDF';
        } else if (isPIRApproved) {
          lapStatus = 'pending';
          lapDesc = 'PIR telah di-ACC, siap menyusun laporan resmi';
        }

        const t4: TimelineStage = {
          key: 'laporan',
          nama: 'Laporan PIR',
          deskripsi: lapDesc,
          status: lapStatus,
        };

        const t5: TimelineStage = {
          key: 'tindak_lanjut',
          nama: 'Tindak Lanjut',
          deskripsi: isSelesai
            ? 'Seluruh rekomendasi tindak lanjut telah diselesaikan'
            : 'Pemantauan tindak lanjut rekomendasi temuan',
          status: isSelesai ? 'selesai' : 'pending',
        };

        return [t1, t2, t3, t4, t5];
      })();

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-900 transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-300 shadow-2xs">
            <ArrowLeft size={16} />
          </div>
          <span>Kembali ke Dashboard</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Action ACC Form jika ada form dan belum di-ACC */}
          {proyek.pir_form_id && !isPIRApproved && (
            <button
              onClick={() => setShowApproveModal(true)}
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle size={16} />
              Setujui & ACC Hasil PIR
            </button>
          )}

          {/* Action Upload TTD jika ada laporan tapi belum ada file TTD */}
          {proyek.laporan_id && !hasSignedPDF && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <UploadCloud size={16} />
              Upload Bukti PDF (TTD)
            </button>
          )}

          {isNeedPIR && !proyek.pir_form_id && (
            <button
              onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}&step=1`)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <PenTool size={16} />
              Inisiasi Formulir PIR
            </button>
          )}

          {proyek.pir_form_id && !proyek.laporan_id && isPIRApproved && (
            <button
              onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}&step=3`)}
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileText size={16} />
              Susun Laporan Resmi
            </button>
          )}

          {hasSignedPDF && (
            <a
              href={getFileUrl(proyek.file_ttd_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileCheck size={16} />
              Buka Dokumen PDF Sah (TTD)
            </a>
          )}
        </div>
      </div>

      {/* Project Hero Header */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-blue-50/80 via-emerald-50/40 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-semibold text-xs rounded-lg border border-blue-100">
              {proyek.kategori}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 font-medium text-xs rounded-lg">
              {proyek.unit_kerja}
            </span>
            <StatusBadge status={proyek.status_pir} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {proyek.nama_kegiatan}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Evaluasi pasca implementasi sistem dan pemantauan keberhasilan solusi TI di lingkungan PT Pupuk Sriwidjaja Palembang
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <Briefcase size={14} /> Vendor / Pengembang
              </div>
              <div className="font-semibold text-gray-800 truncate">
                {proyek.vendor || 'Tim Internal Pusri'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <Calendar size={14} /> Tanggal Rilis
              </div>
              <div className="font-semibold text-gray-800">
                {formatTanggal(proyek.tanggal_go_live)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} /> Kebijakan Batas Waktu
              </div>
              <div className="font-semibold text-emerald-700">
                {effectiveBatasBulan} Bulan Masa Percobaan
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <Clock size={14} /> Batas Toleransi PIR
              </div>
              <div className="font-semibold text-gray-800">
                {formatTanggal(effectiveJatuhTempo)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: 3 KPI Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Capaian & Indikator Kinerja (KPI)</h2>
          <span className="text-xs text-gray-400">Parameter evaluasi hasil PIR</span>
        </div>
        <ProjectKPICards
          kepuasan={effectiveKepuasan}
          kesesuaianTujuan={effectiveKesesuaian}
          tindakLanjutDone={effectiveTLDone}
          tindakLanjutTotal={effectiveTLTotal}
          statusPIR={proyek.status_pir}
        />
      </div>

      {/* Section 2: Visual Timeline 5 Tahap */}
      <ProjectTimeline stages={effectiveStages} />

      {/* Section 3: Interactive Approval & Official Signing Workflow Cards */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="text-amber-400" size={20} />
                <h3 className="text-base font-bold tracking-tight">
                  Alur Persetujuan (ACC) & Pengesahan Dokumen PIR
                </h3>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Siklus kontrol kualitas: ACC data evaluasi oleh VP TI dilanjutkan penandatanganan fisik dokumen resmi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-blue-100 border border-white/15">
                Protokol Standar Tata Kelola TI
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 3 Card: Form PIR ACC */}
            <div className="bg-white/10 rounded-xl p-5 border border-white/15 backdrop-blur-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Tahap 3 • Evaluasi & ACC PIR
                  </span>
                  {isPIRApproved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                      <CheckCircle2 size={12} /> Di-ACC & Disetujui
                    </span>
                  ) : proyek.pir_form_id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      <Clock size={12} /> Menunggu ACC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                      Belum Diisi
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white">Persetujuan Hasil Evaluasi & Survei</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {isPIRApproved
                    ? `Data evaluasi PIR telah diverifikasi dan disetujui secara sah oleh ${proyek.approved_by || 'VP Teknologi Informasi'
                    } ${proyek.approved_at ? `pada ${formatTanggal(proyek.approved_at)}` : ''}.`
                    : proyek.pir_form_id
                      ? 'Formulir evaluasi dan kuesioner responden telah disimpan. Membutuhkan persetujuan (ACC) pejabat berwenang sebelum laporan resmi diterbitkan.'
                      : 'Formulir survei dan observasi PIR belum diisi. Silakan lengkapi formulir evaluasi terlebih dahulu.'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                {isPIRApproved ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                    <UserCheck size={16} />
                    <span>Persetujuan Sah: {proyek.approved_by || 'VP Teknologi Informasi'}</span>
                  </div>
                ) : proyek.pir_form_id ? (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    Setujui & ACC Hasil PIR Sekarang
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}&step=1`)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                  >
                    <PenTool size={14} />
                    Lengkapi Formulir PIR
                  </button>
                )}
              </div>
            </div>

            {/* Step 4 Card: Laporan Resmi & Upload Bukti TTD */}
            <div className="bg-white/10 rounded-xl p-5 border border-white/15 backdrop-blur-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Tahap 4 • Laporan & Bukti Tanda Tangan
                  </span>
                  {hasSignedPDF ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                      <FileCheck size={12} /> Sah & Ditandatangani
                    </span>
                  ) : proyek.laporan_id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      <Clock size={12} /> Menunggu Bukti TTD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                      Menunggu ACC PIR
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white">Laporan Fisik Resmi & Bukti TTD</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {hasSignedPDF
                    ? 'Berkas laporan resmi bertanda tangan Staff TI dan VP TI telah diunggah ke sistem. Siklus evaluasi telah selesai sempurna.'
                    : proyek.laporan_id
                      ? 'Draf laporan resmi telah diterbitkan. Unduh format PDF, lakukan penandatanganan dokumen, lalu unggah bukti scan PDF untuk menyelesaikan proyek.'
                      : isPIRApproved
                        ? 'Data PIR telah di-ACC. Lanjutkan untuk menyusun draf dokumen laporan resmi PIR.'
                        : 'Laporan resmi dapat disusun setelah data form evaluasi PIR disetujui (ACC).'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                {hasSignedPDF ? (
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={getFileUrl(proyek.file_ttd_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition"
                    >
                      <Download size={14} /> Unduh Bukti PDF Sah
                    </a>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      title="Perbarui / Ganti Bukti File TTD"
                      className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-medium transition"
                    >
                      Ganti File
                    </button>
                  </div>
                ) : proyek.laporan_id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadDraft}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition"
                    >
                      <Download size={14} /> Draf PDF
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition"
                    >
                      <UploadCloud size={14} /> Upload TTD
                    </button>
                  </div>
                ) : isPIRApproved ? (
                  <button
                    onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}&step=3`)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                  >
                    <FileText size={14} /> Susun Laporan PIR
                  </button>
                ) : (
                  <div className="text-center text-xs text-gray-300 py-1">
                    Tahap laporan dibuka setelah ACC PIR
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Detailed Project Information & Side Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Detail Ringkasan */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-800 text-sm">Informasi Pelaksanaan Proyek</h3>
            <span className="text-xs text-gray-400 font-mono">ID: {proyek.id.slice(0, 8)}...</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="text-xs text-gray-500 font-medium">Nama Kegiatan TI</div>
              <div className="font-semibold text-gray-800">{proyek.nama_kegiatan}</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="text-xs text-gray-500 font-medium">Unit Kerja Pengelola</div>
              <div className="font-semibold text-gray-800">{proyek.unit_kerja}</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="text-xs text-gray-500 font-medium">Kategori Solusi</div>
              <div className="font-semibold text-gray-800">{proyek.kategori}</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
              <div className="text-xs text-gray-500 font-medium">Penyedia / Vendor Pelaksana</div>
              <div className="font-semibold text-gray-800">{proyek.vendor || '-'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Catatan Regulasi:</span> Berdasarkan pedoman tata kelola TI PT PUSRI,
            masa percobaan pengguna berlangsung selama <span className="font-semibold">2 bulan</span> sejak rilis.
            Setelah masa percobaan selesai, tim TI memiliki waktu toleransi <span className="font-semibold">1 bulan</span> untuk
            melaksanakan pengambilan data evaluasi PIR, memperoleh ACC, dan mengunggah laporan resmi bertanda tangan.
          </div>
        </div>

        {/* Quick Action Panel */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Status & Tahapan</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {proyek.status_pir === 'selesai'
                ? 'Seluruh siklus evaluasi pasca implementasi telah selesai dan tercatat resmi dalam sistem.'
                : proyek.status_pir === 'terlambat'
                  ? 'Proyek telah melampaui batas waktu evaluasi wajib. Segera lengkapi formulir dan unggah laporan ber-TTD.'
                  : 'Proyek dalam proses evaluasi berkala dan persetujuan oleh tim Divisi TI.'}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Status Form PIR</span>
                <span className="font-semibold text-gray-800">
                  {isPIRApproved ? 'Disetujui (ACC)' : proyek.pir_form_id ? 'Menunggu ACC' : 'Belum Dibuat'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Status Laporan</span>
                <span className="font-semibold text-gray-800">
                  {hasSignedPDF
                    ? 'Sah & Bertanda Tangan'
                    : proyek.laporan_id
                      ? 'Draf (Menunggu TTD)'
                      : 'Belum Terbit'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Tindak Lanjut</span>
                <span className="font-semibold text-gray-800">
                  {proyek.tindak_lanjut_total ? `${proyek.tindak_lanjut_done}/${proyek.tindak_lanjut_total} Selesai` : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            {isNeedPIR ? (
              <button
                onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}&step=1`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <PenTool size={14} />
                {proyek.pir_form_id ? 'Edit Formulir PIR' : 'Inisiasi PIR Sekarang'}
              </button>
            ) : (
              <button
                onClick={() => router.push('/laporan-pir')}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={14} />
                Buka Arsip Laporan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Konfirmasi ACC Pengambilan Data PIR */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Persetujuan (ACC) PIR</h3>
                  <p className="text-xs text-gray-500">Konfirmasi penerimaan data survei & observasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-950 space-y-1">
                <span className="font-bold block">Pernyataan Persetujuan:</span>
                <p className="leading-relaxed">
                  Dengan meng-ACC formulir ini, Anda menyatakan bahwa proses pengambilan data evaluasi, kuesioner responden, dan catatan wawancara untuk kegiatan{' '}
                  <span className="font-semibold text-blue-900">{proyek.nama_kegiatan}</span> telah lengkap dan valid untuk diterbitkan sebagai dokumen Laporan Resmi PIR.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">
                  Nama / Jabatan Pejabat Penyetujui:
                </label>
                <input
                  type="text"
                  value={approverInput}
                  onChange={(e) => setApproverInput(e.target.value)}
                  placeholder="Contoh: VP Teknologi Informasi"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={approving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApprovePIR}
                disabled={approving}
                className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
              >
                {approving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyimpan Persetujuan...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    ACC & Setujui Data PIR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Bukti PDF Bertanda Tangan */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Upload Bukti PDF Bertanda Tangan</h3>
                  <p className="text-xs text-gray-500">Pengesahan resmi laporan PIR format PT PUSRI</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Petunjuk Pengesahan:</span>
                Pastikan dokumen draf PDF yang telah diunduh sudah ditandatangani oleh{' '}
                <span className="font-semibold">Staff TI Pemilik</span> dan{' '}
                <span className="font-semibold">VP Teknologi Informasi</span> sebelum diunggah kembali ke sistem.
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-500 transition cursor-pointer relative bg-gray-50/50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="mx-auto text-emerald-600" size={32} />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {selectedFile ? selectedFile.name : 'Pilih file PDF berkas bertanda tangan'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Siap diunggah`
                      : 'Format .pdf maksimal 15MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUploadSigned}
                disabled={uploading || !selectedFile}
                className="inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Mengunggah Berkas...
                  </>
                ) : (
                  <>
                    <FileCheck size={14} />
                    Unggah & Sahkan Laporan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProyekDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-28 space-y-3">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <p className="text-sm text-gray-500">Memuat rincian proyek...</p>
        </div>
      }
    >
      <ProyekDetailContent />
    </Suspense>
  );
}
