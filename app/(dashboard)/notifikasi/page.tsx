'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Filter,
  Loader2,
  CheckCheck,
} from 'lucide-react';
import { proyekApi } from '@/lib/api/proyek';
import { useNotificationStore } from '@/store/notifikasi';
import type { Proyek } from '@/types/proyek';

interface NotificationItem {
  id: string;
  proyekId: string;
  namaKegiatan: string;
  unitKerja: string;
  tanggalGoLive: string;
  tipe: 'terlambat' | 'segera';
  pesan: string;
  tenggatWaktu: string;
}

export default function NotifikasiPage() {
  const router = useRouter();
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'semua' | 'terlambat' | 'segera'>('semua');

  const { readIds, markAsRead, markAllAsRead, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    const fetchProyek = async () => {
      try {
        setLoading(true);
        const data = await proyekApi.list();
        setProyekList(data || []);
      } catch (err) {
        console.error('Gagal memuat proyek:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProyek();
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const formatTanggal = (iso?: string) => {
    if (!iso) return '-';
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];
    const now = new Date();

    (proyekList || []).forEach((p) => {
      const tglGoLive = new Date(p.tanggal_go_live);
      const tglPercobaanSelesai = new Date(tglGoLive);
      tglPercobaanSelesai.setMonth(tglPercobaanSelesai.getMonth() + 2);

      const tglBatasAkhir = new Date(tglPercobaanSelesai);
      tglBatasAkhir.setMonth(tglBatasAkhir.getMonth() + 1);

      const hMinus7 = new Date(tglBatasAkhir);
      hMinus7.setDate(hMinus7.getDate() - 7);

      if (p.status_pir === 'terlambat') {
        items.push({
          id: `telat-${p.id}`,
          proyekId: p.id,
          namaKegiatan: p.nama_kegiatan,
          unitKerja: p.unit_kerja,
          tanggalGoLive: p.tanggal_go_live,
          tipe: 'terlambat',
          pesan: `Melebihi batas waktu evaluasi (>1 bulan setelah masa uji coba 2 bulan sejak ${formatTanggal(tglPercobaanSelesai.toISOString())}). Segera selesaikan form dan unggah laporan ber-TTD.`,
          tenggatWaktu: 'Lewat Toleransi 1 Bulan',
        });
      } else if (p.status_pir === 'pending') {
        const isEskalasi = now >= hMinus7;
        items.push({
          id: `segera-${p.id}`,
          proyekId: p.id,
          namaKegiatan: p.nama_kegiatan,
          unitKerja: p.unit_kerja,
          tanggalGoLive: p.tanggal_go_live,
          tipe: 'segera',
          pesan: isEskalasi
            ? `Peringatan Eskalasi: Mendekati 1 bulan pasca masa uji coba (${formatTanggal(tglPercobaanSelesai.toISOString())}), proses evaluasi PIR belum diselesaikan atau di-ACC (Batas: ${formatTanggal(tglBatasAkhir.toISOString())}).`
            : `Masa uji coba pengguna (2 bulan) telah berakhir pada ${formatTanggal(tglPercobaanSelesai.toISOString())}. Waktu pengambilan data dan pengisian formulir evaluasi PIR telah tiba.`,
          tenggatWaktu: isEskalasi ? 'Peringatan Eskalasi (H-7)' : 'Masa Uji Coba Selesai',
        });
      }
    });

    return items;
  }, [proyekList]);

  const filteredItems = useMemo(() => {
    if (filter === 'semua') return notifications;
    return notifications.filter((n) => n.tipe === filter);
  }, [notifications, filter]);

  const countTerlambat = notifications.filter((n) => n.tipe === 'terlambat').length;
  const countSegera = notifications.filter((n) => n.tipe === 'segera').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="text-blue-900" size={24} />
            Pusat Notifikasi PIR
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Peringatan otomatis proyek yang terlambat atau mendekati batas waktu evaluasi pasca go-live
          </p>
        </div>

        {/* Filter Chips & Mark All Read */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === 'semua'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('terlambat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'terlambat'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Terlambat ({countTerlambat})
            </button>
            <button
              onClick={() => setFilter('segera')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'segera'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Segera ({countSegera})
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => markAllAsRead(notifications.map((n) => n.proyekId))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 hover:text-blue-900 bg-white shadow-2xs transition cursor-pointer"
            >
              <CheckCheck size={14} className="text-emerald-600" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <p className="text-xs text-gray-400 mt-2">Memeriksa status peringatan...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-bold text-gray-800 text-base">Tidak Ada Peringatan Aktif</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Semua proyek berada dalam status aman sesuai jadwal atau telah menyelesaikan siklus evaluasi PIR.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n) => {
            const isTerlambat = n.tipe === 'terlambat';
            const isRead = readIds.includes(n.proyekId);

            return (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isTerlambat
                    ? 'border-rose-100 border-l-4 border-l-rose-500'
                    : 'border-amber-100 border-l-4 border-l-amber-500'
                } ${isRead ? 'opacity-75 bg-gray-50/40' : ''}`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isTerlambat ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {isTerlambat ? <AlertTriangle size={20} /> : <Clock size={20} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{n.namaKegiatan}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isTerlambat
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isTerlambat ? 'Lewat Batas Waktu' : 'Segera (H-7)'}
                      </span>

                      {!isRead ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          Baru
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Sudah Dibaca
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{n.pesan}</p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Building size={12} /> {n.unitKerja}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Go-Live: {formatTanggal(n.tanggalGoLive)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:self-center flex-wrap">
                  {!isRead && (
                    <button
                      onClick={() => markAsRead(n.proyekId)}
                      className="border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-xs font-semibold px-2.5 py-2 rounded-lg transition cursor-pointer"
                      title="Tandai sudah dibaca"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      markAsRead(n.proyekId);
                      router.push(`/proyek/${n.proyekId}`);
                    }}
                    className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    Detail Proyek
                  </button>
                  <button
                    onClick={() => {
                      markAsRead(n.proyekId);
                      router.push(`/pir-form?proyek_id=${n.proyekId}`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    Inisiasi PIR <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
