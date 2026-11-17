'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Building2,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import { pengaturanApi } from '@/lib/api/pengaturan';
import { PengaturanUnitKerja } from '@/types/pengaturan';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConfirmState {
  type: 'single' | 'all';
  unitKerja?: string;
  val?: number;
}

export default function PengaturanPage() {
  const [data, setData] = useState<PengaturanUnitKerja[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingUnit, setSavingUnit] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await pengaturanApi.getAll();
      setData(res || []);
      const initial: Record<string, string> = {};
      (res || []).forEach((item) => {
        initial[item.unit_kerja] = String(item.batas_waktu_bulan);
      });
      setEditedValues(initial);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat pengaturan unit kerja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (unitKerja: string, val: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [unitKerja]: val,
    }));
  };

  const handleRequestSaveOne = (unitKerja: string) => {
    const rawVal = editedValues[unitKerja];
    const valNum = parseInt(rawVal || '', 10);

    if (isNaN(valNum) || valNum < 1 || valNum > 24) {
      setErrorMessage(`Batas waktu untuk ${unitKerja} harus antara 1 sampai 24 bulan`);
      return;
    }

    setConfirmModal({
      type: 'single',
      unitKerja,
      val: valNum,
    });
  };

  const handleRequestSaveAll = () => {
    // Check if any edited value is invalid
    for (const item of data) {
      const rawVal = editedValues[item.unit_kerja];
      const valNum = parseInt(rawVal || '', 10);
      if (isNaN(valNum) || valNum < 1 || valNum > 24) {
        setErrorMessage(
          `Batas waktu untuk "${item.unit_kerja}" tidak valid (${rawVal || 'kosong'}). Harus antara 1 s/d 24 bulan.`
        );
        return;
      }
    }

    setConfirmModal({
      type: 'all',
    });
  };

  const executeSaveOne = async (unitKerja: string, val: number) => {
    setConfirmModal(null);
    try {
      setSavingUnit(unitKerja);
      setErrorMessage(null);
      await pengaturanApi.update(unitKerja, { batas_waktu_bulan: val });
      setSuccessMessage(`Batas waktu untuk unit "${unitKerja}" berhasil disimpan (${val} Bulan)`);
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || `Gagal menyimpan pengaturan untuk ${unitKerja}`);
    } finally {
      setSavingUnit(null);
    }
  };

  const executeSaveAll = async () => {
    setConfirmModal(null);
    try {
      setSavingUnit('ALL');
      setErrorMessage(null);
      for (const item of data) {
        const rawVal = editedValues[item.unit_kerja];
        const valNum = parseInt(rawVal || '', 10);
        if (!isNaN(valNum) && valNum !== item.batas_waktu_bulan) {
          await pengaturanApi.update(item.unit_kerja, { batas_waktu_bulan: valNum });
        }
      }
      setSuccessMessage('Semua perubahan batas waktu unit kerja berhasil disimpan');
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSavingUnit(null);
    }
  };

  // Check if any unit has invalid value across the entire table
  const hasAnyInvalid = data.some((item) => {
    const rawVal = editedValues[item.unit_kerja];
    const valNum = parseInt(rawVal || '', 10);
    return isNaN(valNum) || valNum < 1 || valNum > 24;
  });

  const hasAnyChanged = data.some((item) => {
    const rawVal = editedValues[item.unit_kerja];
    const valNum = parseInt(rawVal || '', 10);
    return !isNaN(valNum) && valNum !== item.batas_waktu_bulan;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-900 via-indigo-900 to-emerald-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-emerald-200 mb-3 border border-white/10">
            <Sliders size={14} /> Konfigurasi Sistem PIR
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Batas Waktu PIR per Unit Kerja
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Atur jangka waktu toleransi evaluasi Post Implementation Review (PIR) setelah tanggal Rilis proyek untuk masing-masing unit kerja di Divisi Teknologi Informasi PT PUSRI.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Alert Messages */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <Card className="border border-gray-200/80 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Daftar Unit Kerja & Parameter Waktu
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Perubahan batas waktu akan memicu kalkulasi status keterlambatan dan jadwal notifikasi peringatan.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin mr-1.5' : 'mr-1.5'} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleRequestSaveAll}
              disabled={loading || savingUnit !== null || !hasAnyChanged || hasAnyInvalid}
              className={`text-xs font-semibold shadow-xs cursor-pointer transition ${
                !hasAnyChanged || hasAnyInvalid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Save size={14} className="mr-1.5" />
              Simpan Semua
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={28} className="animate-spin text-blue-600" />
              <p className="text-sm">Memuat data pengaturan unit kerja...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Tidak ada data unit kerja yang ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Unit Kerja</th>
                    <th className="py-3.5 px-6">Status Unit</th>
                    <th className="py-3.5 px-6">Batas Waktu (Bulan)</th>
                    <th className="py-3.5 px-6">Konversi Notifikasi</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => {
                    const rawVal = editedValues[item.unit_kerja] ?? String(item.batas_waktu_bulan);
                    const valNum = parseInt(rawVal, 10);
                    const isInvalid = isNaN(valNum) || valNum < 1 || valNum > 24;
                    const isChanged = !isInvalid && valNum !== item.batas_waktu_bulan;
                    const isSaving = savingUnit === item.unit_kerja || savingUnit === 'ALL';

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {item.unit_kerja}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge
                            variant={item.aktif ? 'default' : 'secondary'}
                            className={item.aktif ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                          >
                            {item.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 max-w-56">
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={rawVal}
                              onChange={(e) => handleChange(item.unit_kerja, e.target.value)}
                              className={`w-24 px-3 py-1.5 rounded-lg border text-center font-bold text-sm outline-none transition ${
                                isInvalid
                                  ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 bg-white'
                              }`}
                            />
                            <span className="text-xs text-gray-500 font-medium">Bulan</span>
                          </div>
                          {isInvalid ? (
                            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                              <AlertCircle size={12} className="shrink-0" />
                              Wajib antara 1 - 24 bulan
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 block mt-1">Min 1 - Maks 24</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={14} className="text-indigo-500" />
                            <span>
                              H+{!isInvalid ? valNum * 30 : item.batas_waktu_bulan * 30} Hari Rilis
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-600 block mt-0.5">
                            Peringatan: H-7 sebelum jatuh tempo 1 bulan sesudah notifikasi PIR muncul
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            disabled={!isChanged || isSaving || isInvalid}
                            onClick={() => handleRequestSaveOne(item.unit_kerja)}
                            className={`text-xs font-semibold transition cursor-pointer ${
                              isChanged && !isInvalid
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw size={12} className="animate-spin mr-1" />
                            ) : (
                              <Save size={12} className="mr-1" />
                            )}
                            {isChanged ? 'Simpan' : 'Tersimpan'}
                          </Button>
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

      {/* Helpful Guidelines Card */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">Pedoman Standar PIR PT PUSRI:</p>
          <p className="text-amber-800 leading-relaxed">
            Secara default, seluruh proyek wajib menjalani evaluasi PIR paling lambat <strong>2 bulan (60 hari)</strong> setelah Rilis. Khusus untuk unit <strong>Layanan TI</strong> diberikan batas toleransi operasional hingga <strong>3 bulan (90 hari)</strong> untuk pemantauan stabilisasi tiket pengguna.
          </p>
        </div>
      </div>

      {/* MODAL KONFIRMASI SIMPAN */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Konfirmasi Perubahan Batas Waktu PIR
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {confirmModal.type === 'single' ? (
                    <>
                      Apakah Anda yakin ingin mengubah batas waktu PIR untuk unit kerja{' '}
                      <strong className="text-gray-900">{confirmModal.unitKerja}</strong> menjadi{' '}
                      <strong className="text-blue-700">{confirmModal.val} Bulan</strong>?
                    </>
                  ) : (
                    'Apakah Anda yakin ingin menyimpan seluruh perubahan batas waktu evaluasi PIR untuk semua unit kerja yang telah diubah?'
                  )}
                </p>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                Perubahan ini akan langsung mempengaruhi jadwal jatuh tempo evaluasi PIR dan kalkulasi status keterlambatan di seluruh sistem.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmModal(null)}
                className="text-xs font-medium rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'single' && confirmModal.unitKerja && confirmModal.val) {
                    executeSaveOne(confirmModal.unitKerja, confirmModal.val);
                  } else {
                    executeSaveAll();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl px-5 cursor-pointer shadow-xs"
              >
                Ya, Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed pr-2">
                <span className="font-bold block text-[13px] mb-0.5">Berhasil Disimpan</span>
                {successMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
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
