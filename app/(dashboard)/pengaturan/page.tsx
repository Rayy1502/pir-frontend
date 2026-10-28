'use client';

import { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw, Clock, Building2, Info } from 'lucide-react';
import { pengaturanApi } from '@/lib/api/pengaturan';
import { PengaturanUnitKerja } from '@/types/pengaturan';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PengaturanPage() {
  const [data, setData] = useState<PengaturanUnitKerja[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingUnit, setSavingUnit] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await pengaturanApi.getAll();
      setData(res || []);
      const initial: Record<string, number> = {};
      (res || []).forEach((item) => {
        initial[item.unit_kerja] = item.batas_waktu_bulan;
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

  const handleChange = (unitKerja: string, val: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [unitKerja]: val,
    }));
  };

  const handleSaveOne = async (unitKerja: string) => {
    const val = editedValues[unitKerja];
    if (val === undefined || val < 1 || val > 24) {
      setErrorMessage(`Batas waktu untuk ${unitKerja} harus antara 1 sampai 24 bulan`);
      return;
    }

    try {
      setSavingUnit(unitKerja);
      setErrorMessage(null);
      await pengaturanApi.update(unitKerja, { batas_waktu_bulan: val });
      setSuccessMessage(`Batas waktu untuk unit "${unitKerja}" berhasil disimpan (${val} Bulan)`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || `Gagal menyimpan pengaturan untuk ${unitKerja}`);
    } finally {
      setSavingUnit(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSavingUnit('ALL');
      setErrorMessage(null);
      for (const item of data) {
        const val = editedValues[item.unit_kerja];
        if (val !== undefined && val !== item.batas_waktu_bulan) {
          if (val < 1 || val > 24) {
            throw new Error(`Batas waktu untuk ${item.unit_kerja} harus antara 1-24 bulan`);
          }
          await pengaturanApi.update(item.unit_kerja, { batas_waktu_bulan: val });
        }
      }
      setSuccessMessage('Semua perubahan batas waktu unit kerja berhasil disimpan');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSavingUnit(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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

      {/* Alert Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-xs animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
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
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin mr-1.5' : 'mr-1.5'} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={loading || savingUnit !== null}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
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
                    const currentVal = editedValues[item.unit_kerja] ?? item.batas_waktu_bulan;
                    const isChanged = currentVal !== item.batas_waktu_bulan;
                    const isSaving = savingUnit === item.unit_kerja || savingUnit === 'ALL';

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {item.unit_kerja}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {item.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge variant={item.aktif ? 'default' : 'secondary'} className={item.aktif ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}>
                            {item.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 max-w-40">
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={currentVal}
                              onChange={(e) =>
                                handleChange(item.unit_kerja, parseInt(e.target.value) || 1)
                              }
                              className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center font-semibold text-gray-800 text-sm outline-none transition"
                            />
                            <span className="text-xs text-gray-500 font-medium">Bulan</span>
                          </div>
                          <span className="text-[11px] text-gray-400 block mt-1">Min 1 - Maks 24</span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={14} className="text-indigo-500" />
                            <span>H+{currentVal * 30} Hari Rilis</span>
                          </div>
                          <span className="text-[11px] text-amber-600 block mt-0.5">
                            Peringatan: H-7 sebelum jatuh tempo
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            disabled={!isChanged || isSaving}
                            onClick={() => handleSaveOne(item.unit_kerja)}
                            className={`text-xs font-medium transition ${
                              isChanged
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
    </div>
  );
}
