'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Save,
  ArrowRight,
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
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { pirApi } from '@/lib/api/pir';
import { Proyek } from '@/types/proyek';
import { MetodePIR, PIRForm } from '@/types/pir';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function PIRFormWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProyekId = searchParams.get('proyek_id');

  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [selectedProyekId, setSelectedProyekId] = useState<string>(queryProyekId || '');
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [existingPIRId, setExistingPIRId] = useState<string | null>(null);

  // Form Fields
  const [vendor, setVendor] = useState('');
  const [tujuanAwal, setTujuanAwal] = useState('');
  const [metode, setMetode] = useState<MetodePIR>('observasi');
  const [catatanKondisi, setCatatanKondisi] = useState('');
  const [namaNarasumber, setNamaNarasumber] = useState('');
  const [jabatanNarasumber, setJabatanNarasumber] = useState('');
  const [daftarPertanyaan, setDaftarPertanyaan] = useState('');
  const [kesimpulanWawancara, setKesimpulanWawancara] = useState('');
  const [responden, setResponden] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load proyek list
  useEffect(() => {
    proyekApi
      .list()
      .then((res) => {
        setProyekList(res || []);
        if (!selectedProyekId && res && res.length > 0) {
          setSelectedProyekId(res[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // When selectedProyekId changes, fetch project details & any existing PIR draft
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
      .then((pir) => {
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
        } else {
          setExistingPIRId(null);
          setTujuanAwal('');
          setCatatanKondisi('');
          setNamaNarasumber('');
          setJabatanNarasumber('');
          setDaftarPertanyaan('');
          setKesimpulanWawancara('');
          setResponden('');
        }
      })
      .catch((err) => console.error(err));
  }, [selectedProyekId]);

  const handleSubmit = async (isSubmit: boolean) => {
    if (!selectedProyekId) {
      setMessage({ type: 'error', text: 'Pilih proyek terlebih dahulu' });
      return;
    }

    if (isSubmit) {
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

      const status = isSubmit ? 'submitted' : 'draft';

      if (existingPIRId) {
        // Update existing PIR
        await pirApi.update(existingPIRId, {
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
        // Create new PIR
        const res = await pirApi.create({
          proyek_id: selectedProyekId,
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
        setExistingPIRId(res.id);
      }

      setMessage({
        type: 'success',
        text: isSubmit
          ? 'Step 1 berhasil disubmit! Formulir PIR disimpan.'
          : 'Draft formulir PIR berhasil disimpan.',
      });

      if (isSubmit) {
        setTimeout(() => {
          setMessage({
            type: 'success',
            text: 'Step 1 selesai. Menuju Step 2 (Form Survey)...',
          });
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan form PIR' });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Pembuatan PIR', subtitle: 'Metode & Scope', status: 'active' },
    { num: 2, title: 'Form Survey', subtitle: 'Kuesioner Responden', status: 'upcoming' },
    { num: 3, title: 'Laporan PIR', subtitle: 'Format Resmi PUSRI', status: 'upcoming' },
    { num: 4, title: 'Tindak Lanjut', subtitle: 'Tracking Temuan & PIC', status: 'upcoming' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-sm text-gray-500">Memuat formulir PIR...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Step Tracker Indicator */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                st.status === 'active'
                  ? 'bg-blue-50/80 border border-blue-200'
                  : 'bg-gray-50/60 border border-gray-100 opacity-70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                  st.status === 'active'
                    ? 'bg-linear-to-br from-blue-700 to-indigo-800 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {st.num}
              </div>
              <div className="overflow-hidden">
                <div
                  className={`text-xs font-bold leading-tight truncate ${
                    st.status === 'active' ? 'text-blue-950' : 'text-gray-700'
                  }`}
                >
                  {st.title}
                </div>
                <div className="text-[11px] text-gray-400 truncate">{st.subtitle}</div>
              </div>
            </div>
          ))}
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
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Form Container */}
      <Card className="border border-gray-200/90 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
                <Sparkles size={13} />
                Tahap 1 dari 4
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Pembuatan Form PIR (Inisiasi)
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                Lengkapi identitas proyek, lingkup tujuan awal, dan tentukan metode evaluasi PIR yang akan digunakan.
              </CardDescription>
            </div>

            {/* Select Proyek jika ingin ganti */}
            <div className="w-full sm:w-72">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Pilih Proyek:
              </label>
              <select
                value={selectedProyekId}
                onChange={(e) => setSelectedProyekId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
              >
                {proyekList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kegiatan}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Pre-filled Project Readonly Metadata */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building size={16} className="text-blue-600" />
              1. Identitas Proyek Pengembangan TI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="text-xs text-gray-400 font-medium">Nama Kegiatan</label>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">
                  {proyek?.nama_kegiatan || '-'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Calendar size={12} /> Tanggal Go Live
                </label>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">
                  {proyek?.tanggal_go_live
                    ? new Date(proyek.tanggal_go_live).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Layers size={12} /> Unit Kerja
                </label>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">
                  {proyek?.unit_kerja || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vendor & Tujuan Awal */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              2. Lingkup & Pelaksana Pengembangan
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Vendor / Tim Pengembang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Contoh: PT Solusi Digital Mandiri / Tim Internal TI"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tujuan Awal Pengembangan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={tujuanAwal}
                onChange={(e) => setTujuanAwal(e.target.value)}
                placeholder="Tuliskan tujuan dan sasaran awal aplikasi atau sistem ini dikembangkan..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-y"
              />
            </div>
          </div>

          {/* Section 3: Pilihan Metode PIR */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              3. Metode Evaluasi PIR (Pilih Salah Satu) <span className="text-rose-500">*</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Observasi Langsung */}
              <button
                type="button"
                onClick={() => setMetode('observasi')}
                className={`p-4 rounded-xl border-2 text-left transition relative cursor-pointer ${
                  metode === 'observasi'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Eye size={18} />
                  </div>
                  {metode === 'observasi' && (
                    <Badge className="bg-blue-600 text-white text-[10px]">Terpilih</Badge>
                  )}
                </div>
                <div className="font-bold text-sm text-gray-900">Observasi Langsung</div>
                <div className="text-xs text-gray-500 mt-1">
                  Pengecekan fisik dan operasional langsung di lokasi user.
                </div>
              </button>

              {/* Wawancara */}
              <button
                type="button"
                onClick={() => setMetode('wawancara')}
                className={`p-4 rounded-xl border-2 text-left transition relative cursor-pointer ${
                  metode === 'wawancara'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  {metode === 'wawancara' && (
                    <Badge className="bg-blue-600 text-white text-[10px]">Terpilih</Badge>
                  )}
                </div>
                <div className="font-bold text-sm text-gray-900">Wawancara</div>
                <div className="text-xs text-gray-500 mt-1">
                  Diskusi mendalam bersama stakeholder kunci & narasumber.
                </div>
              </button>

              {/* Survey */}
              <button
                type="button"
                onClick={() => setMetode('survey')}
                className={`p-4 rounded-xl border-2 text-left transition relative cursor-pointer ${
                  metode === 'survey'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ClipboardList size={18} />
                  </div>
                  {metode === 'survey' && (
                    <Badge className="bg-blue-600 text-white text-[10px]">Terpilih</Badge>
                  )}
                </div>
                <div className="font-bold text-sm text-gray-900">Survey Kuesioner</div>
                <div className="text-xs text-gray-500 mt-1">
                  Pengumpulan feedback skala luas dari banyak responden.
                </div>
              </button>
            </div>

            {/* Field Dinamis Sesuai Metode */}
            <div className="mt-4 p-5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
              {metode === 'observasi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Catatan Kondisi Lapangan & Temuan Fisik
                    </label>
                    <textarea
                      rows={3}
                      value={catatanKondisi}
                      onChange={(e) => setCatatanKondisi(e.target.value)}
                      placeholder="Jelaskan kondisi infrastruktur, perangkat, atau antarmuka yang diobservasi secara langsung di lokasi..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-dashed border-gray-300 text-center">
                    <p className="text-xs text-gray-500">
                      Upload foto observasi lapangan (disimpan langsung pada database SQL Server / server).
                    </p>
                    <input
                      type="file"
                      disabled
                      className="mt-2 text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                </div>
              )}

              {metode === 'wawancara' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Narasumber
                      </label>
                      <input
                        type="text"
                        value={namaNarasumber}
                        onChange={(e) => setNamaNarasumber(e.target.value)}
                        placeholder="Contoh: Ir. Ahmad Wijaya"
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:border-blue-500 outline-none"
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
                        placeholder="Contoh: Manager Operasional Pabrik"
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Daftar Pertanyaan Wawancara
                    </label>
                    <textarea
                      rows={2}
                      value={daftarPertanyaan}
                      onChange={(e) => setDaftarPertanyaan(e.target.value)}
                      placeholder="Pertanyaan utama terkait keandalan, kemudahan pemakaian, dan efisiensi..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kesimpulan Hasil Wawancara
                    </label>
                    <textarea
                      rows={2}
                      value={kesimpulanWawancara}
                      onChange={(e) => setKesimpulanWawancara(e.target.value)}
                      placeholder="Ringkasan poin penting dan masukan dari narasumber..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {metode === 'survey' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Sasaran Responden
                  </label>
                  <input
                    type="text"
                    value={responden}
                    onChange={(e) => setResponden(e.target.value)}
                    placeholder="Contoh: Seluruh Staff Unit Pengadaan & Vendor Terkait (Est. 30 Responden)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:border-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Detail pertanyaan survey kepuasan dan kesesuaian tujuan akan diisi pada Step 2.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-100 text-xs sm:text-sm font-semibold rounded-xl"
            >
              <Save size={16} className="mr-2" />
              Simpan Draft
            </Button>

            <Button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto bg-linear-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md transition"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <ArrowRight size={16} className="mr-2" />
              )}
              Submit & Lanjut ke Step 2
            </Button>
          </div>
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
