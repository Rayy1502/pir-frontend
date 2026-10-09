'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Proyek } from '@/types/proyek';
import { StatusBadge } from './StatusBadge';

interface Props {
  data: Proyek[];
  onBuatPIR?: (id: string) => void;
  onDetail?: (id: string) => void;
}

export function ProjectTable({ data, onBuatPIR, onDetail }: Props) {
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchQuery = p.namaKegiatan
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchKategori = !kategori || p.kategori === kategori;
      const matchStatus = !status || p.statusPIR === status;
      return matchQuery && matchKategori && matchStatus;
    });
  }, [data, query, kategori, status]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">
          Daftar Pengembangan TI
        </h2>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama kegiatan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Aplikasi">Aplikasi</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="EUC">EUC</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
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
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Nama Kegiatan
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Kategori
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Tgl Go Live
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Unit Kerja
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Status PIR
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const perluBuatPIR =
                p.statusPIR === 'terlambat' || p.statusPIR === 'pending';
              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {p.namaKegiatan}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{p.kategori}</td>
                  <td className="px-5 py-3 text-gray-600">{p.tanggalGoLive}</td>
                  <td className="px-5 py-3 text-gray-600">{p.unitKerja}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.statusPIR} />
                  </td>
                  <td className="px-5 py-3">
                    {perluBuatPIR ? (
                      <button
                        onClick={() => onBuatPIR?.(p.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
                        Buat PIR
                      </button>
                    ) : (
                      <button
                        onClick={() => onDetail?.(p.id)}
                        className="border border-blue-900 text-blue-900 hover:bg-blue-50 text-xs font-medium px-3 py-1.5 rounded-lg"
                      >
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