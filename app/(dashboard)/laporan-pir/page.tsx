'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Printer,
  ExternalLink,
  Loader2,
  Calendar,
  Building,
  CheckCircle2,
  Star,
  FileSpreadsheet,
  X,
  Layers,
  UploadCloud,
  FileCheck,
  Clock,
  FileUp,
} from 'lucide-react';
import { laporanApi } from '@/lib/api/laporan';
import { LaporanPIR } from '@/types/pir';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function LaporanPIRContent() {
  const [laporanList, setLaporanList] = useState<LaporanPIR[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanPIR | null>(null);

  // Upload TTD Modal state
  const [uploadModalLap, setUploadModalLap] = useState<LaporanPIR | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLaporan = (query: string = '') => {
    setLoading(true);
    laporanApi
      .list({ q: query })
      .then((data) => setLaporanList(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const getFileUrl = (relativeUrl?: string | null) => {
    if (!relativeUrl) return '#';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1').replace(/\/v1\/?$/, '');
    return `${baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  };

  const handleDownloadPDF = async (lap: LaporanPIR) => {
    try {
      const cleanNo = lap.nomor_pir.replace(/\//g, '_');
      await laporanApi.downloadPdf(lap.id, `Laporan_${cleanNo}.pdf`);
    } catch (err: any) {
      alert('Gagal mengunduh PDF: ' + (err.message || 'Error'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUploadSignedPDF = async () => {
    if (!uploadModalLap || !uploadFile) {
      setUploadMsg({ type: 'error', text: 'Silakan pilih file PDF bertanda tangan terlebih dahulu.' });
      return;
    }

    try {
      setUploading(true);
      setUploadMsg(null);
      await laporanApi.uploadSignedPdf(uploadModalLap.id, uploadFile);
      setUploadMsg({
        type: 'success',
        text: 'Berkas PDF bertanda tangan berhasil diunggah! Status laporan resmi menjadi Sah.',
      });
      fetchLaporan(search);
      // Update selected modal jika sedang dibuka
      if (selectedLaporan?.id === uploadModalLap.id) {
        setSelectedLaporan((prev) =>
          prev ? { ...prev, file_ttd_url: '/uploads/laporan_ttd/' + uploadFile.name, status_laporan: 'approved' } : null
        );
      }
      setTimeout(() => {
        setUploadModalLap(null);
        setUploadFile(null);
        setUploadMsg(null);
      }, 1200);
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message || 'Gagal mengunggah bukti PDF' });
    } finally {
      setUploading(false);
    }
  };

  const totalLaporan = laporanList.length;
  const avgKepuasan =
    totalLaporan > 0
      ? (
          laporanList.reduce((acc, curr) => acc + (curr.kepuasan || 0), 0) /
          totalLaporan
        ).toFixed(1)
      : '0.0';
  const avgKesesuaian =
    totalLaporan > 0
      ? Math.round(
          laporanList.reduce((acc, curr) => acc + (curr.kesesuaian_tujuan || 0), 0) /
            totalLaporan
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Laporan PIR
            </span>
            <span className="text-2xl font-bold text-blue-950 mt-1 block">
              {totalLaporan} Laporan
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Format resmi PT PUSRI</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Rata-rata Kepuasan
            </span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {avgKepuasan} / 5.0
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Umpan balik stakeholder</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star size={24} className="fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Kesesuaian Tujuan
            </span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {avgKesesuaian}%
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Rata-rata capaian target</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-200/90 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Daftar Dokumen Laporan PIR
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                Seluruh laporan Post Implementation Review resmi yang telah diterbitkan oleh Divisi TI PT PUSRI.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchLaporan(e.target.value);
                  }}
                  placeholder="Cari nomor PIR atau nama proyek..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Link href="/pir-form?step=1">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold">
                  + Buat PIR
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-xs text-gray-500 font-medium">Memuat data laporan...</p>
            </div>
          ) : laporanList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText size={40} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">Belum Ada Laporan PIR</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Laporan akan tercatat di sini setelah Anda menyelesaikan pengisian form PIR sampai Step 3.
              </p>
              <Link href="/pir-form">
                <Button size="sm" className="mt-2 rounded-xl text-xs font-semibold bg-blue-700 text-white">
                  Mulai Buat PIR Sekarang
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">Nomor PIR</th>
                    <th className="px-5 py-3.5">Nama Proyek</th>
                    <th className="px-5 py-3.5">Unit Kerja</th>
                    <th className="px-5 py-3.5">Tgl Laporan</th>
                    <th className="px-5 py-3.5 text-center">Status Pengesahan</th>
                    <th className="px-5 py-3.5 text-center">Kepuasan</th>
                    <th className="px-5 py-3.5 text-center">Kesesuaian</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {laporanList.map((lap) => {
                    const hasTTD = Boolean(lap.file_ttd_url);
                    return (
                      <tr key={lap.id} className="hover:bg-blue-50/40 transition">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80 text-xs">
                            {lap.nomor_pir}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {lap.proyek?.nama_kegiatan || '-'}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {lap.proyek?.unit_kerja || '-'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500 text-xs">
                          {lap.tanggal_laporan}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {hasTTD ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} /> Sah & Bertanda Tangan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={12} /> Menunggu TTD
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="font-bold text-amber-700 border-amber-300 bg-amber-50 text-xs"
                          >
                            ★ {lap.kepuasan?.toFixed(1)} / 5.0
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="font-bold text-emerald-700 border-emerald-300 bg-emerald-50 text-xs"
                          >
                            {lap.kesesuaian_tujuan}%
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLaporan(lap)}
                              className="rounded-lg text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              Detail
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(lap)}
                              className="rounded-lg text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              title="Unduh Draf Format PDF"
                            >
                              <Download size={14} className="mr-1" />
                              PDF
                            </Button>
                            {hasTTD ? (
                              <a
                                href={getFileUrl(lap.file_ttd_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
                                title="Buka Berkas PDF Bertanda Tangan"
                              >
                                <FileCheck size={14} className="mr-1" />
                                TTD
                              </a>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setUploadModalLap(lap)}
                                className="rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                                title="Upload Berkas PDF Bertanda Tangan"
                              >
                                <UploadCloud size={14} className="mr-1" />
                                Upload TTD
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL PREVIEW DETAIL LAPORAN */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Detail Dokumen Laporan PIR
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  {selectedLaporan.nomor_pir}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="rounded-xl text-xs font-semibold"
                >
                  <Printer size={14} className="mr-1.5" />
                  Cetak
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDownloadPDF(selectedLaporan)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  <Download size={14} className="mr-1.5" />
                  Unduh Draf PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedLaporan(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Banner Status Pengesahan */}
            {selectedLaporan.file_ttd_url ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="text-emerald-600 shrink-0" size={22} />
                  <div>
                    <h5 className="font-bold text-sm">Dokumen Laporan Telah Sah Bertanda Tangan</h5>
                    <p className="text-xs text-emerald-700">
                      Berkas fisik/digital resmi telah dibubuhi tanda tangan dan tersimpan di repositori.
                    </p>
                  </div>
                </div>
                <a
                  href={getFileUrl(selectedLaporan.file_ttd_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <ExternalLink size={14} /> Buka Berkas PDF Sah
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="text-amber-600 shrink-0" size={22} />
                  <div>
                    <h5 className="font-bold text-sm">Status: Menunggu Penandatanganan (Draf)</h5>
                    <p className="text-xs text-amber-700">
                      Unduh format draf PDF di atas, mintakan tanda tangan pejabat TI, lalu unggah kembali berkasnya.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setUploadModalLap(selectedLaporan)}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  <UploadCloud size={14} className="mr-1.5" /> Unggah Bukti PDF (TTD)
                </Button>
              </div>
            )}

            {/* Dokumen format resmi PUSRI */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 shadow-sm space-y-6">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-blue-900 pb-4 space-y-1">
                <h2 className="text-lg font-bold tracking-wide text-blue-950 uppercase">
                  PT PUPUK SRIWIDJAJA PALEMBANG
                </h2>
                <h3 className="text-xs font-bold text-emerald-800 tracking-wider">
                  DIVISI TEKNOLOGI INFORMASI
                </h3>
                <p className="text-[11px] text-gray-500">
                  Jl. Mayor Zen, Palembang 30118, Sumatera Selatan | ti@pusri.co.id
                </p>
              </div>

              {/* Judul & Nomor */}
              <div className="text-center space-y-1">
                <h1 className="text-base font-bold text-gray-900 uppercase underline">
                  LAPORAN POST IMPLEMENTATION REVIEW (PIR)
                </h1>
                <p className="text-xs text-gray-600 font-mono">
                  Nomor: {selectedLaporan.nomor_pir}
                </p>
              </div>

              {/* Metadata */}
              <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border-b border-gray-200 uppercase">
                  A. Identitas Proyek TI
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-bold text-gray-500 w-44">Nama Kegiatan</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">
                        {selectedLaporan.proyek?.nama_kegiatan}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-bold text-gray-500">Unit Kerja</td>
                      <td className="px-3 py-2">{selectedLaporan.proyek?.unit_kerja}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-bold text-gray-500">Vendor</td>
                      <td className="px-3 py-2">{selectedLaporan.proyek?.vendor || '-'}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-gray-500">Tanggal Rilis</td>
                      <td className="px-3 py-2">{selectedLaporan.proyek?.tanggal_go_live}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ringkasan */}
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border border-gray-200 rounded-t-lg uppercase">
                  B. Ringkasan Evaluasi
                </div>
                <div className="border-x border-b border-gray-200 p-4 -mt-2 rounded-b-lg space-y-3">
                  <p className="leading-relaxed text-gray-700">{selectedLaporan.ringkasan}</p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="block text-[11px] text-gray-500 font-bold uppercase">
                        Skor Kepuasan
                      </span>
                      <span className="text-base font-bold text-blue-900">
                        {selectedLaporan.kepuasan?.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="block text-[11px] text-gray-500 font-bold uppercase">
                        Kesesuaian Target
                      </span>
                      <span className="text-base font-bold text-emerald-900">
                        {selectedLaporan.kesesuaian_tujuan}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rekomendasi */}
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50/80 px-3 py-1.5 font-bold text-blue-950 border border-gray-200 rounded-t-lg uppercase">
                  C. Rekomendasi
                </div>
                <div className="border-x border-b border-gray-200 p-4 -mt-2 rounded-b-lg">
                  <p className="leading-relaxed text-gray-700">
                    {selectedLaporan.rekomendasi || 'Tidak ada rekomendasi khusus.'}
                  </p>
                </div>
              </div>

              {/* Kolom Tanda Tangan Resmi Format PT PUSRI */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
                  Pengesahan Dokumen Evaluasi Pasca Implementasi (PIR)
                </div>
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-12">
                    <div>
                      <span className="font-semibold text-gray-700 block">Disusun oleh:</span>
                      <span className="text-gray-500">Staff Pemilik Kegiatan TI</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 underline block">( Tim TI Pengusul )</span>
                      <span className="text-[10px] text-gray-400">PT Pupuk Sriwidjaja Palembang</span>
                    </div>
                  </div>
                  <div className="space-y-12">
                    <div>
                      <span className="font-semibold text-gray-700 block">Menyetujui:</span>
                      <span className="text-gray-500">Vice President Teknologi Informasi</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 underline block">( VP TEKNOLOGI INFORMASI )</span>
                      <span className="text-[10px] text-gray-400">PT Pupuk Sriwidjaja Palembang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPLOAD TTD */}
      {uploadModalLap && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Unggah Bukti PDF (TTD)</h3>
                  <p className="text-xs text-gray-500">{uploadModalLap.nomor_pir}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadModalLap(null);
                  setUploadFile(null);
                  setUploadMsg(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {uploadMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  uploadMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {uploadMsg.text}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Pengesahan Resmi:</span>
                Unggah berkas scan PDF dari Laporan PIR nomor{' '}
                <span className="font-bold">{uploadModalLap.nomor_pir}</span> yang telah ditandatangani oleh Staff TI dan VP TI.
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-500 transition cursor-pointer relative bg-gray-50/50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadFile(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="mx-auto text-emerald-600" size={32} />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {uploadFile ? uploadFile.name : 'Pilih file PDF bertanda tangan'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {uploadFile
                      ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Siap diunggah`
                      : 'Format .pdf maksimal 15MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setUploadModalLap(null);
                  setUploadFile(null);
                  setUploadMsg(null);
                }}
                disabled={uploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUploadSignedPDF}
                disabled={uploading || !uploadFile}
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
                    Unggah & Sahkan Dokumen
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

export default function LaporanPIRPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      }
    >
      <LaporanPIRContent />
    </Suspense>
  );
}
