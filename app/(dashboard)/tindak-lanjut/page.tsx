'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Loader2,
  ExternalLink,
  Plus,
  Calendar,
  Building,
  User,
  X,
} from 'lucide-react';
import { tindakLanjutApi } from '@/lib/api/tindak_lanjut';
import { TindakLanjut, TindakLanjutBukti } from '@/types/pir';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function TindakLanjutContent() {
  const [items, setItems] = useState<TindakLanjut[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Upload modal state
  const [selectedItemForUpload, setSelectedItemForUpload] = useState<TindakLanjut | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    tindakLanjutApi
      .list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: search || undefined,
      })
      .then((data) => setItems(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: 'open' | 'in_progress' | 'done') => {
    const item = items.find((t) => t.id === id);
    if (!item) return;

    try {
      await tindakLanjutApi.update(id, {
        temuan: item.temuan,
        pic: item.pic,
        target_selesai: item.target_selesai,
        status: newStatus,
      });

      setItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItemForUpload) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal adalah 10MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const bukti = await tindakLanjutApi.uploadBukti(selectedItemForUpload.id, file);

      // Update state
      setItems((prev) =>
        prev.map((t) => {
          if (t.id === selectedItemForUpload.id) {
            return {
              ...t,
              bukti: [...(t.bukti || []), bukti],
            };
          }
          return t;
        })
      );

      setSelectedItemForUpload((prev) =>
        prev
          ? {
              ...prev,
              bukti: [...(prev.bukti || []), bukti],
            }
          : null
      );
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah file bukti');
    } finally {
      setUploading(false);
    }
  };

  const totalItems = items.length;
  const countOpen = items.filter((t) => t.status === 'open').length;
  const countInProgress = items.filter((t) => t.status === 'in_progress').length;
  const countDone = items.filter((t) => t.status === 'done').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 4 Stat Cards Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Temuan
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {totalItems} Item
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Lintas seluruh proyek TI</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-rose-600 uppercase tracking-wider">
              Open (Belum Mulai)
            </span>
            <span className="text-2xl font-bold text-rose-700 mt-1 block">
              {countOpen} Item
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Perlu penanganan</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-amber-600 uppercase tracking-wider">
              In Progress
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">
              {countInProgress} Item
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Sedang dikerjakan PIC</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Done (Selesai)
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {countDone} Item
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Bukti terlampir lengkap</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <Card className="border border-gray-200/90 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Tracking Tindak Lanjut PIR
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                Monitor komitmen perbaikan, PIC pelaksana, target waktu, dan lampiran bukti fisik perbaikan.
              </CardDescription>
            </div>

            {/* Filter Chips & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Tab Filter */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'open', label: 'Open' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'done', label: 'Done' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-white text-blue-950 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    tindakLanjutApi
                      .list({
                        status: statusFilter === 'all' ? undefined : statusFilter,
                        q: e.target.value || undefined,
                      })
                      .then((data) => setItems(data || []));
                  }}
                  placeholder="Cari temuan atau PIC..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
              <p className="text-xs text-gray-500 font-medium">Memuat data tindak lanjut...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShieldCheck size={40} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">Tidak Ada Item Tindak Lanjut</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Item tindak lanjut dibuat otomatis dari temuan evaluasi pada Step 3 Form PIR.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">Dokumen & Proyek TI</th>
                    <th className="px-5 py-3.5">Temuan / Rekomendasi</th>
                    <th className="px-5 py-3.5">PIC</th>
                    <th className="px-5 py-3.5">Target Selesai</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-center">Bukti</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition">
                      {/* Nomor PIR & Proyek */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                            {item.nomor_pir || 'PIR Form'}
                          </span>
                          <div className="font-bold text-gray-900 text-xs truncate max-w-50">
                            {item.nama_kegiatan || '-'}
                          </div>
                          <div className="text-[11px] text-gray-500">{item.unit_kerja || '-'}</div>
                        </div>
                      </td>

                      {/* Temuan */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="line-clamp-2 text-xs font-semibold text-gray-800 leading-relaxed">
                          {item.temuan}
                        </p>
                      </td>

                      {/* PIC */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <User size={14} className="text-gray-400 shrink-0" />
                          <span>{item.pic || 'Belum Ditentukan'}</span>
                        </div>
                      </td>

                      {/* Target Selesai */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{item.target_selesai || '-'}</span>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as any)
                          }
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                            item.status === 'done'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>

                      {/* Bukti Lampiran */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {item.bukti && item.bukti.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                            <FileCheck size={14} />
                            <span>{item.bukti.length} Bukti</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Belum ada</span>
                        )}
                      </td>

                      {/* Aksi Upload */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItemForUpload(item)}
                          className="rounded-xl text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <UploadCloud size={14} className="mr-1.5" />
                          Bukti ({item.bukti?.length || 0})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL KELOLA & UPLOAD BUKTI */}
      {selectedItemForUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Lampiran Bukti Penyelesaian
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5 line-clamp-1">
                  {selectedItemForUpload.temuan}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForUpload(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error message */}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Dropzone Upload */}
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition">
                {uploading ? (
                  <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                ) : (
                  <UploadCloud size={32} className="text-blue-600 mb-2" />
                )}
                <span className="text-xs font-bold text-blue-900">
                  {uploading ? 'Mengunggah file bukti...' : 'Klik untuk memilih file bukti'}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                  Format PDF, JPG, PNG (Maksimal 10 MB)
                </span>
                <input
                  type="file"
                  disabled={uploading}
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </label>
            </div>

            {/* List Bukti yang Sudah Ada */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                File Bukti Terlampir ({selectedItemForUpload.bukti?.length || 0})
              </span>
              {!selectedItemForUpload.bukti || selectedItemForUpload.bukti.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada file bukti yang diunggah.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedItemForUpload.bukti.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck size={16} className="text-emerald-600 shrink-0" />
                        <span className="font-semibold text-gray-800 truncate">
                          {b.nama_file}
                        </span>
                      </div>
                      <a
                        href={`http://localhost:8080${b.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline font-bold text-xs shrink-0 flex items-center gap-1"
                      >
                        Lihat
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedItemForUpload(null)}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TindakLanjutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }
    >
      <TindakLanjutContent />
    </Suspense>
  );
}
