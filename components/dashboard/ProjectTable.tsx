'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, FileSpreadsheet, Sparkles } from 'lucide-react';
import type { Proyek } from '@/types/proyek';
import { StatusBadge } from './StatusBadge';

interface Props {
  data: Proyek[];
  onBuatPIR?: (id?: string) => void;
  onDetail?: (id: string) => void;
}

export function ProjectTable({ data, onBuatPIR, onDetail }: Props) {
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return (data || []).filter((p) => {
      const matchQuery = (p.nama_kegiatan || '').toLowerCase().includes(query.toLowerCase());
      const matchKategori = !kategori || p.kategori === kategori;
      const matchStatus = !status || p.status_pir === status;
      return matchQuery && matchKategori && matchStatus;
    });
  }, [data, query, kategori, status]);

  const formatTanggal = (iso: string) => {
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const d = new Date(iso);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Daftar Pengembangan TI</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pantau status pelaksanaan PIR untuk seluruh proyek TI</p>
          </div>
          <button
            onClick={() => onBuatPIR?.()}
            className="inline-flex items-center gap-1.5 bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Buat PIR / Proyek Baru</span>
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama kegiatan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Kategori</option>
            <option value="Aplikasi">Aplikasi</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="EUC">EUC</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Status PIR</option>
            <option value="selesai">Selesai</option>
            <option value="pending">Pending</option>
            <option value="terlambat">Terlambat</option>
            <option value="belum-jatuh-tempo">Belum jatuh tempo</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Nama Kegiatan</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Kategori</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Tgl Rilis</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Unit Kerja</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status PIR</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-14 px-4">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">
                        {data.length === 0 ? 'Belum Ada Data Proyek Pengembangan TI' : 'Tidak ada data yang cocok'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        {data.length === 0
                          ? 'Dashboard saat ini kosong. Mulai dengan membuat PIR pertama Anda untuk mendaftarkan evaluasi sistem baru.'
                          : 'Coba ubah kata kunci pencarian atau filter kategori/status.'}
                      </p>
                    </div>
                    {data.length === 0 && (
                      <button
                        onClick={() => onBuatPIR?.()}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
                      >
                        <Plus size={16} /> Buat PIR Pertama
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const isSelesai = p.status_pir === 'selesai';
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{p.nama_kegiatan}</td>
                  <td className="px-5 py-3 text-gray-600">{p.kategori}</td>
                  <td className="px-5 py-3 text-gray-600">{formatTanggal(p.tanggal_go_live)}</td>
                  <td className="px-5 py-3 text-gray-600">{p.unit_kerja}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status_pir} /></td>
                  <td className="px-5 py-3">
                    {!isSelesai ? (
                      <button onClick={() => onBuatPIR?.(p.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer">
                        Buat PIR
                      </button>
                    ) : (
                      <button onClick={() => onDetail?.(p.id)}
                        className="border border-blue-900 text-blue-900 hover:bg-blue-50 text-xs font-medium px-3.5 py-1.5 rounded-lg transition cursor-pointer">
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}