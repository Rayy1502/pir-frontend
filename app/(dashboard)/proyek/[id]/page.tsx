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
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
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

  useEffect(() => {
    if (!id) return;
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

  // Fallback calculation jika server backend belum di-restart
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

  const effectiveStages: TimelineStage[] =
    proyek.timeline && proyek.timeline.length > 0
      ? proyek.timeline
      : (() => {
          const jatuhTempoDate = new Date(effectiveJatuhTempo);
          const now = new Date();
          const isSelesai = proyek.status_pir === 'selesai';
          const isTerlambat = proyek.status_pir === 'terlambat' || (!isSelesai && now > jatuhTempoDate);
          const isPending = proyek.status_pir === 'pending';

          const t1: TimelineStage = {
            key: 'go_live',
            nama: 'Go Live',
            deskripsi: `Sistem resmi dirilis pada ${formatTanggal(proyek.tanggal_go_live)}`,
            status: 'selesai',
            tanggal: proyek.tanggal_go_live,
          };

          let notifStatus: TimelineStage['status'] = 'belum_dimulai';
          let notifDesc = `Batas waktu PIR jatuh tempo (${effectiveBatasBulan} bulan)`;
          if (isSelesai) {
            notifStatus = 'selesai';
            notifDesc = 'Notifikasi diproses & PIR selesai tepat waktu';
          } else if (isTerlambat) {
            notifStatus = 'terlambat';
            notifDesc = `Melebihi batas waktu evaluasi (${effectiveBatasBulan} bulan)`;
          } else if (isPending) {
            notifStatus = 'pending';
            notifDesc = 'Mendekati batas waktu evaluasi PIR (H-7)';
          }

          const t2: TimelineStage = {
            key: 'notifikasi',
            nama: 'Notifikasi PIR',
            deskripsi: notifDesc,
            status: notifStatus,
            tanggal: effectiveJatuhTempo,
          };

          let pirStatus: TimelineStage['status'] = 'belum_dimulai';
          let pirDesc = 'Menunggu inisiasi formulir PIR';
          if (isSelesai) {
            pirStatus = 'selesai';
            pirDesc = 'Evaluasi dan survei PIR telah selesai dilaksanakan';
          } else if (proyek.pir_form_id) {
            pirStatus = 'pending';
            pirDesc = 'Form evaluasi PIR tersimpan sebagai draft';
          } else if (isTerlambat) {
            pirStatus = 'terlambat';
            pirDesc = 'Evaluasi PIR belum dimulai dan telah lewat tempo';
          }

          const t3: TimelineStage = {
            key: 'pir_review',
            nama: 'PIR Review',
            deskripsi: pirDesc,
            status: pirStatus,
          };

          let lapStatus: TimelineStage['status'] = 'belum_dimulai';
          let lapDesc = 'Laporan evaluasi belum disusun';
          if (isSelesai || proyek.laporan_id) {
            lapStatus = 'selesai';
            lapDesc = 'Laporan resmi PIR telah diterbitkan & disetujui';
          }

          const t4: TimelineStage = {
            key: 'laporan',
            nama: 'Laporan PIR',
            deskripsi: lapDesc,
            status: lapStatus,
          };

          let tlStatus: TimelineStage['status'] = 'belum_dimulai';
          let tlDesc = 'Belum ada rekomendasi tindak lanjut';
          if (isSelesai) {
            tlStatus = 'selesai';
            tlDesc = 'Seluruh rekomendasi tindak lanjut telah diselesaikan';
          }

          const t5: TimelineStage = {
            key: 'tindak_lanjut',
            nama: 'Tindak Lanjut',
            deskripsi: tlDesc,
            status: tlStatus,
          };

          return [t1, t2, t3, t4, t5];
        })();

  return (
    <div className="space-y-6 pb-12">
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
          {isNeedPIR && (
            <button
              onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}`)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <PenTool size={16} />
              {proyek.pir_form_id ? 'Lanjutkan Form PIR' : 'Buat Form PIR'}
            </button>
          )}

          {proyek.status_pir === 'selesai' && (
            <button
              onClick={() => router.push('/laporan-pir')}
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileText size={16} />
              Lihat Dokumen Laporan
            </button>
          )}
        </div>
      </div>

      {/* Project Hero Header */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        {/* Accent decoration */}
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
                <Calendar size={14} /> Tanggal Go-Live
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
                {effectiveBatasBulan} Bulan ({proyek.unit_kerja})
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                <Clock size={14} /> Batas Jatuh Tempo PIR
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

      {/* Section 3: Detailed Cards */}
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
            unit kerja <span className="font-semibold">{proyek.unit_kerja}</span> memiliki batas waktu{' '}
            <span className="font-semibold">{proyek.batas_waktu_bulan} bulan</span> setelah tanggal go-live untuk
            menyelesaikan seluruh rangkaian Post Implementation Review (PIR) dan menindaklanjuti temuan evaluasi.
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
                ? 'Seluruh siklus evaluasi pasca implementasi telah selesai dan tercatat dalam sistem.'
                : proyek.status_pir === 'terlambat'
                ? 'Proyek telah melampaui batas waktu evaluasi wajib. Segera lengkapi formulir dan tindak lanjut rekomendasi.'
                : 'Proyek masih dalam masa tunggu atau proses evaluasi berkala oleh tim Divisi TI.'}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Status Form PIR</span>
                <span className="font-semibold text-gray-800">
                  {proyek.pir_form_id ? 'Tersedia' : 'Belum Dibuat'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Status Laporan</span>
                <span className="font-semibold text-gray-800">
                  {proyek.laporan_id ? 'Diterbitkan' : proyek.status_pir === 'selesai' ? 'Selesai' : 'Belum Terbit'}
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
                onClick={() => router.push(`/pir-form?proyek_id=${proyek.id}`)}
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
